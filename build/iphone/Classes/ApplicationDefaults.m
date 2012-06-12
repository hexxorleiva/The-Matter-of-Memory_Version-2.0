/**
* Appcelerator Titanium Mobile
* This is generated code. Do not modify. Your changes *will* be lost.
* Generated code is Copyright (c) 2009-2011 by Appcelerator, Inc.
* All Rights Reserved.
*/
#import <Foundation/Foundation.h>
#import "TiUtils.h"
#import "ApplicationDefaults.h"
 
@implementation ApplicationDefaults
  
+ (NSMutableDictionary*) copyDefaults
{
    NSMutableDictionary * _property = [[NSMutableDictionary alloc] init];

    [_property setObject:[TiUtils stringValue:@"dEGuebjj35RiSYU7PXTXvNificWZUIKb"] forKey:@"acs-oauth-secret-production"];
    [_property setObject:[TiUtils stringValue:@"oDSTZ2HS9J3DTqulheMrTvGV1HFoygqr"] forKey:@"acs-oauth-key-production"];
    [_property setObject:[TiUtils stringValue:@"WzlEEJFAYqXOH816yRI3QHuVnbeO1Dwp"] forKey:@"acs-api-key-production"];
    [_property setObject:[TiUtils stringValue:@"WFBVeuC9CTwjYT74wrr1l6gu3KNiLzRA"] forKey:@"acs-oauth-secret-development"];
    [_property setObject:[TiUtils stringValue:@"5REOUVqoAU54eEgJl0reVpaieDSuHrVX"] forKey:@"acs-oauth-key-development"];
    [_property setObject:[TiUtils stringValue:@"md41P9xbuRicwZHHgaX5yOFvSt0pEc7S"] forKey:@"acs-api-key-development"];
    [_property setObject:[TiUtils stringValue:@"system"] forKey:@"ti.ui.defaultunit"];

    return _property;
}
@end
