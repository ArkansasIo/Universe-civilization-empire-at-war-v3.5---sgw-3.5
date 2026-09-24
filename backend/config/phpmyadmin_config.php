<?php
/**
 * ============================================================================
 * Universe Civilization & Stargate Warfare - phpMyAdmin Configuration Snippet
 * ============================================================================
 * 
 * Add or append this configuration block into your phpMyAdmin `config.inc.php`
 * file (e.g. in /xampp/phpMyAdmin/config.inc.php, /etc/phpmyadmin/config.inc.php,
 * or Docker phpMyAdmin environment) for quick access to `stargate_universe_db`.
 */

// Example phpMyAdmin Server Configuration Block:
/*
$i++;
$cfg['Servers'][$i]['verbose'] = 'Stargate Warfare Universe DB';
$cfg['Servers'][$i]['host'] = '127.0.0.1';
$cfg['Servers'][$i]['port'] = '3306';
$cfg['Servers'][$i]['socket'] = '';
$cfg['Servers'][$i]['connect_type'] = 'tcp';
$cfg['Servers'][$i]['extension'] = 'mysqli';
$cfg['Servers'][$i]['auth_type'] = 'cookie'; // or 'config' for auto-login
$cfg['Servers'][$i]['user'] = 'root';
$cfg['Servers'][$i]['password'] = '';
$cfg['Servers'][$i]['only_db'] = 'stargate_universe_db'; // Filter specifically to this game database
$cfg['Servers'][$i]['hide_db'] = '^(information_schema|performance_schema|mysql|sys)';
$cfg['Servers'][$i]['AllowNoPassword'] = true;
*/

// phpMyAdmin Navigation & UX Optimizations for Large Fleet & World MMOs:
$phpmyadmin_recommended_settings = [
    // Increase memory limit for massive battle log imports
    'ExecTimeLimit' => 300,
    'MemoryLimit' => '256M',
    
    // Default collation & charset
    'DefaultCharset' => 'utf8mb4',
    'DefaultConnectionCollation' => 'utf8mb4_unicode_ci',
    
    // Quick navigation tree formatting
    'NavigationTreeDisplayItemFilterMinimum' => 10,
    'MaxRows' => 50,
    'SendErrorReports' => 'never',
    'Console' => [
        'Mode' => 'collapse',
        'EnterExecutes' => true,
    ],
];

return $phpmyadmin_recommended_settings;
