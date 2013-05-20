/**
 * Ti.Passbook Module
 * Copyright (c) 2013 by Appcelerator, Inc. All Rights Reserved.
 * Please see the LICENSE included with this distribution for details.
 */

#ifndef __IPHONE_6_0
#define __IPHONE_6_0     60000
#endif

#import "TiModule.h"

@interface TiPassbookModule : TiModule
{
@private
   PKPassLibrary *_passLibrary;
}

@end
