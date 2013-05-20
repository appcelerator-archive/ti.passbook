/**
 * Ti.Passbook Module
 * Copyright (c) 2013 by Appcelerator, Inc. All Rights Reserved.
 * Please see the LICENSE included with this distribution for details.
 */

#import <PassKit/PassKit.h>
#import "TiPassbookModule.h"
#import "TiBase.h"
#import "TiHost.h"
#import "TiUtils.h"
#import "TiApp.h"
#import "TiPassbookPassProxy.h"

@implementation TiPassbookModule

#pragma mark Internal

// this is generated for your module, please do not change it
-(id)moduleGUID
{
	return @"e46dcae2-4553-4ebb-9fe2-1b234776727a";
}

// this is generated for your module, please do not change it
-(NSString*)moduleId
{
	return @"ti.passbook";
}

#pragma mark Lifecycle

-(void)startup
{
	// this method is called when the module is first loaded
	// you *must* call the superclass
	[super startup];
    
#if  __IPHONE_OS_VERSION_MAX_ALLOWED < __IPHONE_6_0
    NSLog(@"[ERROR] Passbook module compiled without support for iOS 6.0! Nothing will work unless you recompile the module!");
    return;
#endif
    if (![TiUtils isIOS6OrGreater]) {
        NSLog(@"[ERROR] Passbook module does not support less than iOS 6.0");
        return;
    }
    
    _passLibrary = [[PKPassLibrary alloc] init];

    // Listen for PKLibraryEvents
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(passLibraryDidChange:) name:PKPassLibraryDidChangeNotification object:_passLibrary];
	
	NSLog(@"[INFO] %@ loaded",self);    
}

-(void)shutdown:(id)sender
{
	// this method is called when the module is being unloaded
	// typically this is during shutdown. make sure you don't do too
	// much processing here or the app will be quit forceably
	
    // Listening for PKLibraryEvents
    [[NSNotificationCenter defaultCenter] removeObserver:self];
    
	// you *must* call the superclass
	[super shutdown:sender];
}

#pragma mark Cleanup 

-(void)dealloc
{
    RELEASE_TO_NIL(_passLibrary);
	// release any resources that have been retained by the module
	[super dealloc];
}

#pragma mark Listener Notifications

-(void)passLibraryDidChange:(NSNotification *)note
{
    NSDictionary *userInfo = [note userInfo];
    NSArray *passArray;
    
    if ((passArray = [userInfo objectForKey:PKPassLibraryAddedPassesUserInfoKey]) && [self _hasListeners:@"addedpasses"]) {
        NSDictionary *event = [self pkPassArrayToEventDictionary:passArray];
        [self fireEvent:@"addedpasses" withObject:event];
    }
    
    if ((passArray = [userInfo objectForKey: PKPassLibraryRemovedPassInfosUserInfoKey]) && [self _hasListeners:@"removedpasses"]) {
        NSDictionary *event = [self passIdArrayToEventDictionary:passArray];
        [self fireEvent:@"removedpasses" withObject:event];
    }
    
    if ((passArray = [userInfo objectForKey:PKPassLibraryReplacementPassesUserInfoKey]) && [self _hasListeners:@"replacedpasses"]) {
        NSDictionary *event = [self pkPassArrayToEventDictionary:passArray];
        [self fireEvent:@"replacedpasses" withObject:event];
    }
}

-(NSDictionary *)pkPassArrayToEventDictionary:(NSArray *)passArray
{
    NSMutableArray *passes = [NSMutableArray arrayWithCapacity:[passArray count]];
    for (PKPass *pkPass in passArray) {
        [passes addObject:[[[TiPassbookPassProxy alloc] initWithPass:pkPass pageContext:[self executionContext]] autorelease]];
    }
    return [NSDictionary dictionaryWithObject:passes forKey:@"passes"];
}

-(NSDictionary *)passIdArrayToEventDictionary:(NSArray *)passArray
{
    NSMutableArray *passes = [NSMutableArray arrayWithCapacity:[passArray count]];
    for (NSDictionary *passDict in passArray) {
        [passes addObject:[NSDictionary dictionaryWithObjectsAndKeys:
                           [passDict objectForKey:PKPassLibraryPassTypeIdentifierUserInfoKey], @"passTypeIdentifier",
                           [passDict objectForKey:PKPassLibrarySerialNumberUserInfoKey], @"serialNumber",
                           nil]];
    }
    return [NSDictionary dictionaryWithObject:passes forKey:@"passIds"];
}

#pragma mark - Public APIs

-(id)isPassLibraryAvailable:(id)args
{
    return NUMBOOL([PKPassLibrary isPassLibraryAvailable]);
}

-(void)addPass:(id)args
{
    ENSURE_SINGLE_ARG(args, NSDictionary);
    TiBlob *blob = [args objectForKey:@"passData"];
    ENSURE_TYPE(blob, TiBlob);
    
    NSError *error = nil;
    PKPass *pass = [[[PKPass alloc] initWithData:blob.data error:&error] autorelease];
    if (error) {
        [self throwException:[error localizedDescription]
                   subreason:nil
                    location:CODELOCATION];
        return;
    }
    
    __block PKAddPassesViewController *addPassVC = [[PKAddPassesViewController alloc] initWithPass:pass];
    if (!addPassVC) {
        [self throwException:@"PKAssPassesViewController could not be created."
                   subreason:nil
                    location:CODELOCATION];
        return;
    }
    
    [[TiApp controller] presentViewController:addPassVC animated:YES completion:^{
        RELEASE_TO_NIL(addPassVC);
    }];
}

-(id)containsPass:(id)args
{
    ENSURE_SINGLE_ARG(args, NSDictionary);
    TiBlob *blob = [args objectForKey:@"passData"];
    ENSURE_TYPE(blob, TiBlob);
    
    NSError *error = nil;
    PKPass *pass = [[[PKPass alloc] initWithData:blob.data error:&error] autorelease];
    if (error) {
        [self throwException:[error localizedDescription]
                   subreason:nil
                    location:CODELOCATION];
        return NUMBOOL(NO);
    }
    
    return NUMBOOL([_passLibrary containsPass:pass]);
}

-(void)removePass:(id)args
{
    ENSURE_SINGLE_ARG(args, TiPassbookPassProxy);
    [_passLibrary removePass:[args pass]];
}

-(id)replacePass:(id)args
{
    ENSURE_SINGLE_ARG(args, NSDictionary);
    TiBlob *blob = [args objectForKey:@"passData"];
    ENSURE_TYPE(blob, TiBlob);
    
    NSError *error = nil;
    PKPass *pass = [[[PKPass alloc] initWithData:blob.data error:&error] autorelease];
    if (error) {
        [self throwException:[error localizedDescription]
                   subreason:nil
                    location:CODELOCATION];
        return NUMBOOL(NO);
    }
    
    return NUMBOOL([_passLibrary replacePassWithPass:pass]);
}

-(TiPassbookPassProxy *)getPass:(id)args
{
    ENSURE_SINGLE_ARG(args, NSDictionary);
    NSString *passTypeIdentifier = [args objectForKey:@"passTypeIdentifier"];
    NSString *serialNumber = [args objectForKey:@"serialNumber"];
    
    ENSURE_STRING(passTypeIdentifier);
    ENSURE_STRING(serialNumber);
    
    PKPass *pkPass = [_passLibrary passWithPassTypeIdentifier:passTypeIdentifier serialNumber:serialNumber];
    if (!pkPass) {
        return nil;
    }
    
    return [[[TiPassbookPassProxy alloc] initWithPass:pkPass pageContext:[self executionContext]] autorelease];
}

-(void)showPass:(id)args
{
    ENSURE_SINGLE_ARG(args, TiPassbookPassProxy);
    
    PKPass *pkPass = [args pass];
    [[UIApplication sharedApplication] openURL:[pkPass passURL]];
}

#pragma mark Properties

-(NSArray *)passes
{
    NSArray *pkPasses = [_passLibrary passes];
    NSMutableArray *result = [NSMutableArray arrayWithCapacity:[pkPasses count]];
    
    [pkPasses enumerateObjectsUsingBlock:^(PKPass *pkPass, NSUInteger idx, BOOL *stop){
        [result addObject:[[[TiPassbookPassProxy alloc] initWithPass:pkPass pageContext:[self executionContext]] autorelease]];
    }];
    
    return result;
}

@end
