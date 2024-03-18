// Operations on rules
const glob = require('glob');
const path = require('path');

function getAllRules(additionalRulesDirs) {
  let rules = {};
  
  const rulesDirs = [
    path.join(__dirname, 'rules')
  ].concat(additionalRulesDirs || []);

  rulesDirs.forEach(rulesDir => {
    rulesDir = path.resolve(rulesDir);
    glob.sync(`${rulesDir}/*.js`).forEach(file => {
      const rule = require(file);
      rules[rule.name] = rule;
    });
  });
  return rules;
}

function getRule(rule, additionalRulesDirs) {
  return getAllRules(additionalRulesDirs)[rule];
}

function doesRuleExist(rule, additionalRulesDirs) {
  return getRule(rule, additionalRulesDirs) !== undefined;
}

function isRuleEnabled(ruleConfig) {
  if (Array.isArray(ruleConfig)) {
    return ruleConfig[0] === 'on';
  }
  return ruleConfig === 'on';
}

function runAllEnabledRules(feature, file, configuration, additionalRulesDirs) {
  let errors = [];
  const rules = getAllRules(additionalRulesDirs);
  Object.keys(rules).forEach(ruleName => {
    let rule = rules[ruleName];
    if (isRuleEnabled(configuration[rule.name])) {
      const ruleConfig = Array.isArray(configuration[rule.name]) ? configuration[rule.name][1] : {};
      const error = rule.run(feature, file, ruleConfig);
      if (error) {
        errors = errors.concat(error);
      }
    }
  });
  return errors;
}
function runAllEnabledRulesForBrowsers(feature,file,configuration) {
  let errors = [];
  var rules = {};
  const availableRules = [
    'allowes-tags',
    'indentation',
    'keywords-in-logical-order',
    'max-scenarios-per-file',
    'name-length',
    'no-background-only-scenario',
    'no-duplicate-tags',
    'no-empty-file',
    'no-example-in-scenarios',
    'no-files-without-scenarios',
    'no-homogenous-tags',
    'no-partially-commented-tag-lines',
    'no-restricted-patterns',
    'no-restricted-tags',
    'no-scenario-outlines-without-examples',
    'no-unnamed-scenarios',
    'no-unnamed-features',
    'no-unnamed-scenarios',
    'no-unused-variables',
    'one-space-between-tags',
    'required-tags',
    'scenario-size',
    'use-and'
  ];
  if(availableRules!= undefined) {
    availableRules.forEach((ruleFile)=> {
      const rule = require('./rules/'+ruleFile+'.js');
      rules[rule.name] = rule;
    });
  }
  Object.keys(rules).forEach((ruleName)=>{
    let rule = rules[ruleName];
    if(isRuleEnabled(configuration[rule.name])) {
      const ruleConfig = Array.isArray(configuration[rule.name]) ? configuration[rule.name][1] : {};
      const error = rule.run(feature, file, ruleConfig);
      if (error) {
        errors.forEach((error)=>{
          if(ruleConfig.type == 'error') {
            error.type = 'error';
          } else {
            error.type = 'warning';
          }
        });
      }
    }
  });
  return errors;
}

module.exports = {
  doesRuleExist: doesRuleExist,
  isRuleEnabled: isRuleEnabled,
  runAllEnabledRules: runAllEnabledRules,
  getRule: getRule,
  getAllRules: getAllRules,
  runAllEnabledRulesForBrowsers: runAllEnabledRulesForBrowsers
};
