/**
 * Ti.Passbook Module
 * Copyright (c) 2013-2016 by Appcelerator, Inc. All Rights Reserved.
 * Please see the LICENSE included with this distribution for details.
 */

#import <PassKit/PassKit.h>
#import "TiPassbookPassProxy.h"
#import "TiBlob.h"
#import "TiPassbookModule.h"

@implementation TiPassbookPassProxy

@synthesize pass = _pass;

-(TiPassbookPassProxy *)initWithPass:(PKPass *)pass pageContext:(id<TiEvaluator>)context
{
    if (self = [super _initWithPageContext:context]) {
        _pass = [pass retain];
    }
    return self;
}

-(void)dealloc
{
    RELEASE_TO_NIL(_pass);
    [super dealloc];
}

#pragma mark Public APIs

-(id)localizedValueForFieldKey:(id)arg
{
    ENSURE_SINGLE_ARG(arg, NSString);
    return [_pass localizedValueForFieldKey:arg];
}

#pragma mark Properties

#define MAKE_READONLY_PROP(obj,name) \
-(id)name \
{\
return [obj name];\
}\

MAKE_READONLY_PROP(_pass, passURL);

MAKE_READONLY_PROP(_pass, authenticationToken);
MAKE_READONLY_PROP(_pass, passTypeIdentifier);
MAKE_READONLY_PROP(_pass, serialNumber);
MAKE_READONLY_PROP(_pass, webServiceURL);

MAKE_READONLY_PROP(_pass, localizedName);
MAKE_READONLY_PROP(_pass, localizedDescription);
MAKE_READONLY_PROP(_pass, organizationName);
MAKE_READONLY_PROP(_pass, relevantDate);

-(TiBlob*)icon
{
    return [[[TiBlob alloc] initWithImage:[_pass icon]] autorelease];
}

-(id)userInfo
{
    return [_pass userInfo];
}

-(id)deviceName
{
    if (![TiUtils isIOS9OrGreater]) {
        NSLog(@"[WARN] Ti.Passbook.Pass.deviceName is only available in iOS 9 and later.");
        return;
    }
    return [_pass deviceName];
}

-(NSNumber*)isRemotePass
{
    if (![TiUtils isIOS9OrGreater]) {
        NSLog(@"[WARN] Ti.Passbook.Pass.isRemotePass is only available in iOS 9 and later.");
        return;
    }
    
    return NUMBOOL([_pass isRemotePass]);
}

@end
