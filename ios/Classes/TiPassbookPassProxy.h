/**
 * Ti.Passbook Module
 * Copyright (c) 2013-2016 by Appcelerator, Inc. All Rights Reserved.
 * Please see the LICENSE included with this distribution for details.
 */

#import <Foundation/Foundation.h>
#import "TiProxy.h"

@interface TiPassbookPassProxy : TiProxy
{
}
@property(readonly, nonatomic) PKPass *pass;

-(TiPassbookPassProxy *)initWithPass:(PKPass *)pass pageContext:(id<TiEvaluator>)context;

@end
