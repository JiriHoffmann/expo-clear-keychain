const { withAppDelegate } = require('expo/config-plugins');

const withClearKeychain = (cfg) => {
  cfg = withAppDelegate(cfg, (config) => {
    // TODO: create a more reliable way of inserting
    const insertIndex = config.modResults.contents.search('launchOptions') + 15;
    const start = config.modResults.contents.substring(0, insertIndex);
    const insert = `
  NSUserDefaults* defaults = [NSUserDefaults standardUserDefaults];
  [defaults synchronize];

  BOOL shouldClearCache = [defaults boolForKey:@"ClearKeychainSwitch"];
  if(shouldClearCache){
    NSArray *secItemClasses = @[(__bridge id)kSecClassGenericPassword,
                                (__bridge id)kSecClassInternetPassword,
                                (__bridge id)kSecClassCertificate,
                                (__bridge id)kSecClassKey,
                                (__bridge id)kSecClassIdentity];
    for (id secItemClass in secItemClasses) {
        NSDictionary *spec = @{(__bridge id)kSecClass: secItemClass};
        SecItemDelete((__bridge CFDictionaryRef)spec);
    }
    [defaults setBool:NO forKey:@"ClearKeychainSwitch"];
  }
    `;
    const end = config.modResults.contents.substring(insertIndex + 1);
    const result = start + insert + end;

    config.modResults.contents = result;
    return config;
  });
  return cfg;
};

module.exports = function withPlugin(config) {
  config = withClearKeychain(config);
  return config;
};
