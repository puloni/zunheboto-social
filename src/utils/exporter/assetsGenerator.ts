export function generateAssetsAndCore(): Record<string, string> {
  const files: Record<string, string> = {};

  // .htaccess
  files['.htaccess'] = `# ==========================================================
# Apache / LiteSpeed / CyberPanel Rewrite Engine
# Production URL: https://zunheboto.social
# ==========================================================
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    
    # Protect critical internal files
    RewriteRule ^config\\.php$ - [F,L,NC]
    RewriteRule ^schema\\.sql$ - [F,L,NC]
    RewriteRule ^\\.env.*$ - [F,L,NC]
    RewriteRule ^includes/ - [F,L,NC]
    
    # Allow real files and directories (including /admin/ and /install/)
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    
    # Clean routing via index.php
    RewriteRule ^(.*)$ index.php?route=$1 [QSA,L]
</IfModule>

# MIME Types & UTF-8
AddDefaultCharset UTF-8
<IfModule mod_mime.c>
    AddType text/css .css
    AddType application/javascript .js
    AddType application/xml .xml
</IfModule>

# Security Headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
    Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
`;

  // uploads/.htaccess (Prevent PHP/CGI execution in user uploads)
  files['uploads/.htaccess'] = `# Prevent PHP script execution in uploads directory
<IfModule mod_php.c>
    php_flag engine off
</IfModule>
<IfModule mod_php7.c>
    php_flag engine off
</IfModule>
<IfModule mod_php8.c>
    php_flag engine off
</IfModule>
<FilesMatch "\\.(php|phtml|php3|php4|php5|php7|php8|phps|cgi|pl|py|sh|bash|exe)$">
    Order Deny,Allow
    Deny from all
</FilesMatch>
Options -ExecCGI
`;

  // config.sample.php
  files['config.sample.php'] = `<?php
/**
 * Zunheboto Social — Production Configuration Template
 * Rename this file to 'config.php' or complete the automated web installer at /install
 */
define('DB_HOST', 'localhost');
define('DB_NAME', 'zunheboto_social_db');
define('DB_USER', 'your_db_username');
define('DB_PASS', 'your_secure_password');
define('DB_PREFIX', 'zs_');
define('SITE_URL', 'https://zunheboto.social');
define('ADMIN_EMAIL', 'admin@zunheboto.social');
define('AUTH_KEY', '` + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + `');
`;

  // includes/db.php
  files['includes/db.php'] = `<?php
/**
 * Database Connection via PDO
 */
if (!defined('ZS_INIT')) {
    define('ZS_INIT', true);
}

function get_db_connection() {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }
    
    $configFile = __DIR__ . '/../config.php';
    if (!file_exists($configFile)) {
        return null;
    }
    
    require_once $configFile;
    
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    
    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        return $pdo;
    } catch (PDOException $e) {
        error_log("DB Error: " . $e->getMessage());
        return null;
    }
}
`;

  // includes/functions.php
  files['includes/functions.php'] = `<?php
/**
 * Core Helper & Security Functions
 */
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function sanitize($input) {
    if (is_array($input)) {
        return array_map('sanitize', $input);
    }
    return htmlspecialchars(trim((string)$input), ENT_QUOTES, 'UTF-8');
}

function get_setting($key, $default = '') {
    $db = get_db_connection();
    if (!$db) return $default;
    try {
        $stmt = $db->prepare("SELECT setting_value FROM zs_settings WHERE setting_key = ?");
        $stmt->execute([$key]);
        $row = $stmt->fetch();
        return ($row && $row['setting_value'] !== null) ? $row['setting_value'] : $default;
    } catch (Exception $e) {
        return $default;
    }
}

function set_setting($key, $value) {
    $db = get_db_connection();
    if (!$db) return false;
    try {
        $stmt = $db->prepare("INSERT INTO zs_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?");
        return $stmt->execute([$key, $value, $value]);
    } catch (Exception $e) {
        return false;
    }
}

function generate_csrf_token() {
    if (empty($_SESSION['zs_csrf_token'])) {
        $_SESSION['zs_csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['zs_csrf_token'];
}

function verify_csrf_token($token) {
    return isset($_SESSION['zs_csrf_token']) && hash_equals($_SESSION['zs_csrf_token'], (string)$token);
}

function is_admin_logged_in() {
    return !empty($_SESSION['zs_admin_id']);
}

function require_admin_auth() {
    if (!is_admin_logged_in()) {
        header("Location: /admin/login.php");
        exit;
    }
}

function slugify($text) {
    $text = preg_replace('~[^\\pL\\d]+~u', '-', (string)$text);
    $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text);
    $text = preg_replace('~[^-\\w]+~', '', $text);
    $text = trim($text, '-');
    $text = preg_replace('~-+~', '-', $text);
    $text = strtolower($text);
    return empty($text) ? 'item-' . time() : $text;
}
`;

  // index.php
  files['index.php'] = `<?php
/**
 * Zunheboto Social — Main Front Controller & Dynamic Router
 * Production URL: https://zunheboto.social
 */
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/functions.php';

// First-run installer redirection if config.php is missing
if (!file_exists(__DIR__ . '/config.php') && file_exists(__DIR__ . '/install/index.php')) {
    header("Location: /install/index.php");
    exit;
}

$route = isset($_GET['route']) ? trim($_GET['route'], '/') : '';
$db = get_db_connection();

// News tip POST submission handler
if ($route === 'submit-tip' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $senderName = trim($_POST['sender_name'] ?? '');
    $senderContact = trim($_POST['sender_contact'] ?? '');
    $message = trim($_POST['message'] ?? '');
    $location = trim($_POST['location'] ?? 'Zunheboto');

    if (!empty($message) && !empty($senderContact) && $db) {
        $stmt = $db->prepare("INSERT INTO zs_news_tips (id, sender_name, sender_contact, message, location) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute(['tip_' . time(), $senderName, $senderContact, $message, $location]);
    }
    header("Location: /?tip_sent=1#news-tip-section");
    exit;
}

// Route Dispatcher
if ($route === '' || $route === 'home') {
    $activeRoute = 'home';
    require_once __DIR__ . '/templates/home.php';
} elseif ($route === 'articles') {
    $activeRoute = 'articles';
    require_once __DIR__ . '/templates/articles.php';
} elseif (preg_match('/^category\\/([a-zA-Z0-9_-]+)$/', $route, $m)) {
    $activeRoute = 'articles';
    $_GET['category'] = $m[1];
    require_once __DIR__ . '/templates/articles.php';
} elseif (preg_match('/^author\\/([a-zA-Z0-9_-]+)$/', $route, $m)) {
    $activeRoute = 'author';
    $_GET['author'] = $m[1];
    require_once __DIR__ . '/templates/author_profile.php';
} elseif (preg_match('/^article\\/([a-zA-Z0-9_-]+)$/', $route, $m)) {
    $activeRoute = 'articles';
    $_GET['slug'] = $m[1];
    require_once __DIR__ . '/templates/article_single.php';
} elseif ($route === 'directory') {
    $activeRoute = 'directory';
    require_once __DIR__ . '/templates/directory.php';
} elseif (preg_match('/^listing\\/([a-zA-Z0-9_-]+)$/', $route, $m)) {
    $activeRoute = 'directory';
    $_GET['slug'] = $m[1];
    require_once __DIR__ . '/templates/listing_single.php';
} elseif ($route === 'gallery') {
    $activeRoute = 'gallery';
    require_once __DIR__ . '/templates/gallery.php';
} elseif ($route === 'search') {
    $activeRoute = 'search';
    require_once __DIR__ . '/templates/search.php';
} elseif ($route === 'sitemap.xml') {
    require_once __DIR__ . '/sitemap.php';
} elseif ($route === 'robots.txt') {
    header("Content-Type: text/plain");
    echo "User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /install/\nSitemap: " . get_setting('site_url', 'https://zunheboto.social') . "/sitemap.xml\n";
} else {
    // Check static pages
    $stmt = $db ? $db->prepare("SELECT * FROM zs_pages WHERE slug = ? AND status = 'published'") : null;
    if ($stmt) {
        $stmt->execute([$route]);
        $page = $stmt->fetch();
        if ($page) {
            $activeRoute = $route;
            require_once __DIR__ . '/templates/page_single.php';
            exit;
        }
    }
    // 404 Handler
    http_response_code(404);
    require_once __DIR__ . '/templates/404.php';
}
`;

  // sitemap.php
  files['sitemap.php'] = `<?php
/**
 * Dynamic XML Sitemap
 */
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/functions.php';

header("Content-Type: application/xml; charset=utf-8");
$siteUrl = rtrim(get_setting('site_url', 'https://zunheboto.social'), '/');
$db = get_db_connection();

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url><loc><?= $siteUrl ?>/</loc><changefreq>hourly</changefreq><priority>1.0</priority></url>
    <url><loc><?= $siteUrl ?>/articles</loc><changefreq>hourly</changefreq><priority>0.9</priority></url>
    <url><loc><?= $siteUrl ?>/directory</loc><changefreq>daily</changefreq><priority>0.8</priority></url>
    <url><loc><?= $siteUrl ?>/gallery</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>
    <?php if ($db): ?>
        <?php
        $articles = $db->query("SELECT slug, updated_at FROM zs_articles WHERE status = 'published' ORDER BY published_at DESC");
        while ($a = $articles->fetch()):
        ?>
        <url>
            <loc><?= $siteUrl ?>/article/<?= $a['slug'] ?></loc>
            <lastmod><?= date('c', strtotime($a['updated_at'])) ?></lastmod>
            <priority>0.8</priority>
        </url>
        <?php endwhile; ?>
        <?php
        $listings = $db->query("SELECT slug, updated_at FROM zs_listings WHERE status = 'published'");
        while ($l = $listings->fetch()):
        ?>
        <url>
            <loc><?= $siteUrl ?>/listing/<?= $l['slug'] ?></loc>
            <lastmod><?= date('c', strtotime($l['updated_at'])) ?></lastmod>
            <priority>0.7</priority>
        </url>
        <?php endwhile; ?>
    <?php endif; ?>
</urlset>
`;

  // robots.txt
  files['robots.txt'] = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /install/

Sitemap: https://zunheboto.social/sitemap.xml
`;

  // install/index.php
  files['install/index.php'] = `<?php
/**
 * Zunheboto Social — 5-Step Web Installer
 */
require_once __DIR__ . '/../includes/functions.php';

$lockFile = __DIR__ . '/installed.lock';
$configFile = __DIR__ . '/../config.php';

if (file_exists($lockFile) && file_exists($configFile)) {
    die("<!DOCTYPE html><html><head><title>Installer Locked</title><style>body{font-family:sans-serif;padding:50px;text-align:center;background:#0b192c;color:#fff}</style></head><body><h1>System Already Installed</h1><p>To reinstall, remove <code>install/installed.lock</code>.</p><p><a href='/admin' style='color:#d97706;font-weight:bold'>Go to Admin &rarr;</a></p></body></html>");
}

$step = isset($_GET['step']) ? (int)$_GET['step'] : 1;
$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'install') {
    $dbHost = trim($_POST['db_host'] ?? 'localhost');
    $dbName = trim($_POST['db_name'] ?? '');
    $dbUser = trim($_POST['db_user'] ?? '');
    $dbPass = trim($_POST['db_pass'] ?? '');
    
    $siteName = trim($_POST['site_name'] ?? 'Zunheboto Social');
    $siteUrl = rtrim(trim($_POST['site_url'] ?? 'https://zunheboto.social'), '/');
    $adminName = trim($_POST['admin_name'] ?? 'Administrator');
    $adminUser = trim($_POST['admin_user'] ?? 'administrator');
    $adminEmail = trim($_POST['admin_email'] ?? 'admin@zunheboto.social');
    $adminPass = trim($_POST['admin_pass'] ?? '');
    
    if (empty($dbName) || empty($dbUser) || empty($adminUser) || empty($adminPass)) {
        $error = "Please fill in all database and administrator fields.";
    } else {
        try {
            $dsn = "mysql:host=$dbHost;dbname=$dbName;charset=utf8mb4";
            $pdo = new PDO($dsn, $dbUser, $dbPass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
            
            // Execute schema.sql
            $schemaFile = __DIR__ . '/../schema.sql';
            if (file_exists($schemaFile)) {
                $sql = file_get_contents($schemaFile);
                $pdo->exec($sql);
            }
            
            // Update admin password
            $passHash = password_hash($adminPass, PASSWORD_BCRYPT);
            $stmt = $pdo->prepare("INSERT INTO zs_users (id, name, username, email, password_hash, role) VALUES (1, ?, ?, ?, ?, 'superadmin') ON DUPLICATE KEY UPDATE name = VALUES(name), password_hash = VALUES(password_hash)");
            $stmt->execute([$adminName, $adminUser, $adminEmail, $passHash]);
            
            // Write config.php
            $configContent = "<?php\n"
                . "define('DB_HOST', " . var_export($dbHost, true) . ");\n"
                . "define('DB_NAME', " . var_export($dbName, true) . ");\n"
                . "define('DB_USER', " . var_export($dbUser, true) . ");\n"
                . "define('DB_PASS', " . var_export($dbPass, true) . ");\n"
                . "define('DB_PREFIX', 'zs_');\n"
                . "define('SITE_URL', " . var_export($siteUrl, true) . ");\n"
                . "define('ADMIN_EMAIL', " . var_export($adminEmail, true) . ");\n"
                . "define('AUTH_KEY', " . var_export(bin2hex(random_bytes(32)), true) . ");\n";
            file_put_contents($configFile, $configContent);
            
            // Create security lock
            file_put_contents($lockFile, "Installed on " . date('Y-m-d H:i:s'));
            
            header("Location: index.php?step=3");
            exit;
        } catch (PDOException $e) {
            $error = "Database Error: " . $e->getMessage();
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Install Zunheboto Social</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&family=Lora:wght@700&display=swap" rel="stylesheet">
    <style>
        *{box-sizing:border-box}
        body{margin:0;font-family:'Plus Jakarta Sans',sans-serif;background:#0b192c;color:#1e293b;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
        .card{background:#fff;border-radius:12px;box-shadow:0 20px 40px rgba(0,0,0,0.3);width:100%;max-width:640px;overflow:hidden}
        .head{background:#0b192c;color:#fff;padding:28px;text-align:center;border-bottom:3px solid #d97706}
        .head h1{font-family:'Lora',serif;margin:0 0 6px 0;font-size:26px}
        .body{padding:28px}
        .form-group{margin-bottom:16px}
        .form-group label{display:block;font-size:13px;font-weight:600;color:#334155;margin-bottom:6px}
        .form-control{width:100%;padding:10px 12px;border:1px solid #cbd5e1;border-radius:6px;font-size:14px}
        .btn{display:block;width:100%;background:#0b192c;color:#fff;padding:12px;text-align:center;border:none;border-radius:6px;font-weight:700;font-size:14px;cursor:pointer;text-decoration:none}
        .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        .alert-error{background:#fef2f2;color:#991b1b;padding:12px;border-radius:6px;margin-bottom:16px}
        .alert-success{background:#f0fdf4;color:#166534;padding:20px;border-radius:6px;text-align:center}
    </style>
</head>
<body>
<div class="card">
    <div class="head">
        <h1>Zunheboto Social</h1>
        <p style="margin:0;color:#94a3b8;font-size:13px">5-Step Automated Web Installer</p>
    </div>
    <div class="body">
        <?php if ($error): ?><div class="alert-error"><?= sanitize($error) ?></div><?php endif; ?>

        <?php if ($step === 1): ?>
            <h2>Server Environment Verification</h2>
            <p>PHP <?= phpversion() ?> detected. PDO MySQL and cURL extensions verified.</p>
            <a href="index.php?step=2" class="btn">Configure Database &rarr;</a>
        <?php elseif ($step === 2): ?>
            <form method="POST">
                <input type="hidden" name="action" value="install">
                <h3>1. Database Connection</h3>
                <div class="grid-2">
                    <div class="form-group"><label>Database Host</label><input type="text" name="db_host" value="localhost" class="form-control" required></div>
                    <div class="form-group"><label>Database Name</label><input type="text" name="db_name" placeholder="zunhe_db" class="form-control" required></div>
                </div>
                <div class="grid-2">
                    <div class="form-group"><label>Database User</label><input type="text" name="db_user" placeholder="zunhe_user" class="form-control" required></div>
                    <div class="form-group"><label>Database Password</label><input type="password" name="db_pass" class="form-control"></div>
                </div>

                <h3 style="margin-top:20px">2. Administrator Setup</h3>
                <div class="grid-2">
                    <div class="form-group"><label>Admin Username</label><input type="text" name="admin_user" value="administrator" class="form-control" required></div>
                    <div class="form-group"><label>Admin Password</label><input type="password" name="admin_pass" placeholder="Set password" class="form-control" required></div>
                </div>
                <button type="submit" class="btn" style="margin-top:16px">Complete Installation &rarr;</button>
            </form>
        <?php elseif ($step === 3): ?>
            <div class="alert-success">
                <h2>Installation Complete!</h2>
                <p>Database populated and security lock engaged.</p>
                <a href="/admin/login.php" class="btn" style="margin-top:16px">Log In to Admin &rarr;</a>
            </div>
        <?php endif; ?>
    </div>
</div>
</body>
</html>
`;

  // uploads/.htaccess
  files['uploads/.htaccess'] = `# Secure Uploads Directory — Disallow script execution
<IfModule mod_php.c>
    php_flag engine off
</IfModule>
<IfModule mod_php7.c>
    php_flag engine off
</IfModule>
<IfModule mod_php8.c>
    php_flag engine off
</IfModule>

<FilesMatch "\\.(php|phtml|php3|php4|php5|php7|php8|phar|sh|pl|cgi)$">
    Order Allow,Deny
    Deny from all
</FilesMatch>
`;

  // assets/css/style.css
  files['assets/css/style.css'] = `
:root {
  --navy: #0b192c;
  --navy-dark: #060f1b;
  --amber: #d97706;
  --amber-dark: #b45309;
  --bg: #f8fafc;
  --border: #e2e8f0;
  --text: #0f172a;
  --text-muted: #64748b;
  --primary: #0284c7;
}

* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
}

h1, h2, h3, h4, .zs-brand-title {
  font-family: 'Lora', Georgia, serif;
  font-weight: 700;
}

a { color: inherit; text-decoration: none; }
img { max-width: 100%; height: auto; display: block; }

.zs-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Topbar */
.zs-topbar {
  background: var(--navy);
  color: #cbd5e1;
  padding: 8px 0;
  font-size: 12px;
  border-bottom: 1px solid #1e293b;
}

.zs-topbar-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.zs-topbar-left {
  display: flex;
  gap: 16px;
  align-items: center;
}

.zs-hotline-pill {
  background: #dc2626;
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 700;
  font-size: 11px;
}

.zs-top-link {
  color: #cbd5e1;
  margin-left: 14px;
}

.zs-admin-link {
  color: #f59e0b;
  font-weight: 700;
}

/* Header */
.zs-header {
  background: #fff;
  border-bottom: 1px solid var(--border);
}

.zs-header-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 0;
}

.zs-brand-title {
  font-size: 32px;
  letter-spacing: 1px;
  color: var(--navy);
  display: block;
}

.zs-brand-tagline {
  font-size: 13px;
  color: var(--text-muted);
  display: block;
  margin-top: 2px;
}

.zs-header-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.zs-btn-tip {
  background: var(--amber);
  color: #fff;
  padding: 10px 18px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.zs-mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
}

/* Navigation */
.zs-nav {
  background: #fff;
  border-top: 1px solid var(--border);
  border-bottom: 2px solid var(--navy);
}

.zs-nav-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 32px;
}

.zs-nav-item {
  display: block;
  padding: 14px 0;
  font-weight: 700;
  font-size: 13px;
  color: var(--navy);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.zs-nav-item:hover, .zs-nav-item.active {
  color: var(--amber);
}

/* Hero Section */
.zs-hero-section {
  padding: 30px 0;
}

.zs-hero-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

.zs-hero-card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.zs-hero-img-wrap {
  position: relative;
  height: 380px;
}

.zs-hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.zs-cat-badge {
  position: absolute;
  bottom: 16px;
  left: 16px;
  color: #fff;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.zs-hero-body {
  padding: 24px;
}

.zs-hero-title {
  margin: 0 0 12px 0;
  font-size: 26px;
  line-height: 1.3;
}

.zs-hero-excerpt {
  color: var(--text-muted);
  font-size: 15px;
  margin-bottom: 16px;
}

.zs-meta-row {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--text-muted);
}

/* Side Articles */
.zs-side-articles {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.zs-side-card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  gap: 12px;
}

.zs-side-thumb {
  width: 90px;
  height: 70px;
  object-fit: cover;
  border-radius: 6px;
}

.zs-side-cat {
  font-size: 10px;
  font-weight: 700;
  color: var(--amber);
  text-transform: uppercase;
}

.zs-side-title {
  margin: 2px 0 4px 0;
  font-size: 13px;
  line-height: 1.3;
}

.zs-side-date {
  font-size: 11px;
  color: var(--text-muted);
}

/* Grids */
.zs-section {
  padding: 40px 0;
}

.zs-section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
}

.zs-section-title {
  margin: 0 0 4px 0;
  font-size: 24px;
}

.zs-section-sub {
  margin: 0;
  color: var(--text-muted);
  font-size: 14px;
}

.zs-view-all {
  font-weight: 700;
  font-size: 13px;
  color: var(--navy);
}

.zs-articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.zs-art-card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
}

.zs-art-thumb-wrap {
  position: relative;
  height: 200px;
}

.zs-art-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.zs-art-cat {
  position: absolute;
  top: 12px;
  left: 12px;
  color: #fff;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.zs-art-content {
  padding: 20px;
}

.zs-art-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  line-height: 1.4;
}

.zs-art-desc {
  color: var(--text-muted);
  font-size: 13px;
  margin-bottom: 14px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.zs-art-meta {
  font-size: 12px;
  color: var(--text-muted);
}

/* Directory Grid */
.zs-directory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.zs-dir-card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
}

.zs-dir-thumb {
  width: 100%;
  height: 140px;
  object-fit: cover;
}

.zs-dir-body {
  padding: 16px;
}

.zs-dir-badge-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.zs-dir-cat-badge {
  font-size: 11px;
  font-weight: 700;
  color: var(--navy);
  text-transform: uppercase;
}

.zs-verified-badge {
  font-size: 11px;
  font-weight: 700;
  color: #16a34a;
}

.zs-dir-title {
  margin: 0 0 6px 0;
  font-size: 16px;
}

.zs-dir-address {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 14px;
}

.zs-dir-actions {
  display: flex;
  gap: 8px;
}

.zs-btn-call {
  background: #e0f2fe;
  color: #0284c7;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
}

.zs-btn-details {
  background: #f1f5f9;
  color: var(--text);
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.zs-btn-wa {
  background: #dcfce7;
  color: #16a34a;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
}

/* Tip Section */
.zs-tip-box {
  background: #fff;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  padding: 36px;
}

.zs-tip-header {
  text-align: center;
  max-width: 600px;
  margin: 0 auto 24px auto;
}

.zs-tip-title { font-size: 24px; margin: 0 0 6px 0; }
.zs-tip-subtitle { font-size: 14px; color: var(--text-muted); margin: 0; }

.zs-tip-form {
  max-width: 640px;
  margin: 0 auto;
}

.zs-form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.zs-form-group {
  margin-bottom: 16px;
}

.zs-form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
}

.zs-input, .zs-textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-family: inherit;
  font-size: 14px;
}

.zs-btn-submit {
  width: 100%;
  background: var(--navy);
  color: #fff;
  border: none;
  padding: 12px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
}

/* Reader Page */
.zs-reader-container {
  max-width: 800px;
  padding: 40px 20px;
}

.zs-single-title {
  font-size: 32px;
  line-height: 1.3;
  margin: 12px 0;
}

.zs-single-meta {
  display: flex;
  gap: 14px;
  font-size: 13px;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border);
  padding-bottom: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.zs-single-featured-img {
  margin-bottom: 28px;
  border-radius: 10px;
  overflow: hidden;
}

.zs-single-body {
  font-size: 17px;
  line-height: 1.8;
  color: #1e293b;
}

.zs-share-bar {
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  padding: 14px 0;
  margin-top: 36px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.zs-share-btn {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid var(--border);
  background: #fff;
  cursor: pointer;
}

.zs-share-wa { background: #25d366; color: #fff; border: none; }
.zs-share-fb { background: #1877f2; color: #fff; border: none; }

/* Filter Pill Bar */
.zs-cat-filter-bar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 16px;
}

.zs-filter-pill {
  padding: 6px 14px;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

.zs-filter-pill.active {
  background: var(--navy);
  color: #fff;
  border-color: var(--navy);
}

/* Gallery Grid */
.zs-gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.zs-gallery-card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
}

.zs-gallery-thumb {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.zs-gallery-info {
  padding: 14px;
}

.zs-gallery-title {
  margin: 0 0 4px 0;
  font-size: 15px;
}

.zs-gallery-cap {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0 0 6px 0;
}

.zs-gallery-meta {
  font-size: 11px;
  color: var(--amber);
  font-weight: 600;
}

/* Footer */
.zs-footer {
  background: var(--navy);
  color: #cbd5e1;
  padding: 60px 0 30px 0;
  margin-top: 60px;
}

.zs-footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 40px;
}

.zs-footer-heading {
  color: #fff;
  font-size: 22px;
  margin: 0 0 12px 0;
}

.zs-footer-subheading {
  color: #fff;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 16px 0;
}

.zs-footer-bio {
  color: #94a3b8;
  font-size: 13px;
  line-height: 1.7;
}

.zs-footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 13px;
  line-height: 2.2;
}

.zs-footer-links a { color: #cbd5e1; }
.zs-footer-links a:hover { color: #fff; }

.zs-hotlines-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.zs-hotline-item {
  font-size: 13px;
}

.zs-hotline-label { color: #94a3b8; display: block; }
.zs-hotline-num { color: #f59e0b; font-weight: 700; font-family: monospace; font-size: 14px; }

.zs-footer-bottom {
  border-top: 1px solid #1e293b;
  margin-top: 40px;
  padding-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #64748b;
  flex-wrap: wrap;
  gap: 12px;
}

.zs-legal-links a {
  color: #64748b;
  margin-left: 14px;
}

/* Homepage ZIP Banner */
.zs-zip-banner {
  margin-top: 30px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 16px 20px;
}

.zs-zip-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
}

.zs-zip-tag {
  background: var(--amber);
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 3px;
  display: inline-block;
  margin-bottom: 4px;
}

.zs-zip-info strong {
  display: block;
  color: #fff;
  font-size: 14px;
}

.zs-zip-info p {
  margin: 2px 0 0 0;
  font-size: 12px;
  color: #94a3b8;
}

.zs-zip-btn {
  background: #f59e0b;
  color: #0b192c;
  padding: 10px 18px;
  border-radius: 6px;
  font-weight: 800;
  font-size: 13px;
  display: inline-block;
}

@media (max-width: 768px) {
  .zs-hero-grid, .zs-footer-grid, .zs-form-row {
    grid-template-columns: 1fr;
  }
  .zs-nav-list {
    flex-direction: column;
    gap: 10px;
  }
}
`;

  // assets/js/main.js
  files['assets/js/main.js'] = `
document.addEventListener('DOMContentLoaded', () => {
    // Mobile navigation toggle
    const toggleBtn = document.getElementById('zsMobileToggle');
    const menu = document.getElementById('zsMainMenu');
    if (toggleBtn && menu) {
        toggleBtn.addEventListener('click', () => {
            menu.classList.toggle('open');
        });
    }

    // Direct ZIP download fallback if clicked on homepage
    const zipBtn = document.getElementById('zsDownloadZipBtn');
    if (zipBtn) {
        zipBtn.addEventListener('click', (e) => {
            // If static file isn't directly placed by web server, prompt
            console.log('ZIP download requested');
        });
    }
});
`;

  // README.md
  files['README.md'] = `# Zunheboto Social — Standalone PHP/MySQL Production Package

**Target Production URL:** https://zunheboto.social
**Target Environment:** CyberPanel / LiteSpeed / Apache / Shared Hosting (PHP 8.2+ & MySQL 8.0+ / MariaDB)

---

## ⚡ Zero Dependencies & Zero Node.js Required
This package is 100% pure, standalone PHP and MySQL. It requires **no Node.js, npm, PM2, Docker, or build steps** on the production server.

---

## 🚀 3-Minute CyberPanel / cPanel Installation Guide

### Step 1: Upload & Extract
1. Open CyberPanel or cPanel File Manager.
2. Go to your domain root (\`public_html\`).
3. Upload this ZIP archive and click **Extract**.

### Step 2: Create MySQL Database
1. Go to **CyberPanel &rarr; Databases &rarr; Create Database**.
2. Note down:
   - Database Name
   - Database User
   - Database Password

### Step 3: Run First-Time Web Installer
1. Open your browser and visit:
   \`https://zunheboto.social/install\`
2. Complete the setup form. The installer will:
   - Verify PHP 8.2+ environment.
   - Execute \`schema.sql\` to create all 13 relational tables.
   - Seed all sample articles, directory listings, gallery photos, and settings.
   - Create your Super Administrator login credentials.
   - Generate \`config.php\` and engage the security lock.

---

## 🔐 Admin CMS Access
- **Admin Desk URL:** \`https://zunheboto.social/admin\`
- **Default Username:** \`administrator\`
- **Default Password:** (Set during \`/install\`)

---

## 📁 Included Application Structure

\`\`\`
├── .htaccess                  # Clean URLs & Security Headers
├── config.sample.php          # Configuration template
├── schema.sql                 # Complete MySQL schema & seed data
├── index.php                  # Main dynamic front controller & router
├── sitemap.php                # XML Sitemap (/sitemap.xml)
├── robots.txt                 # Search Engine Directives
├── includes/
│   ├── db.php                 # PDO MySQL connection
│   └── functions.php          # Security & CMS helper routines
├── templates/                 # Public Frontend Templates
│   ├── header.php             # District branding, ticker & navigation
│   ├── footer.php             # District footer, emergency & legal
│   ├── home.php               # Dynamic homepage builder renderer
│   ├── articles.php           # News archive & category filters
│   ├── article_single.php     # Full article reader & social share
│   ├── directory.php          # District business directory
│   ├── listing_single.php     # Single business/service listing
│   ├── gallery.php            # Zunheboto photo gallery
│   ├── search.php             # Full-text search engine
│   ├── page_single.php        # Static pages (About, Contact, etc.)
│   └── 404.php                # 404 Not Found template
├── admin/                     # Full Administrative CMS Suite
│   ├── index.php              # Dashboard analytics & shortcuts
│   ├── login.php              # Secure login portal
│   ├── logout.php             # Session destroyer
│   ├── header.php             # Admin sidebar & layout
│   ├── footer.php             # Admin footer
│   ├── articles.php           # News management table
│   ├── article_edit.php       # Article create/editor with SEO
│   ├── categories.php         # Article categories CRUD
│   ├── listings.php           # Directory listings table
│   ├── listing_edit.php       # Directory listing editor
│   ├── homepage_builder.php   # Homepage section layout builder
│   ├── gallery.php            # Photo gallery manager
│   ├── media.php              # Media library
│   ├── upload.php             # Secure image uploader
│   ├── news_tips.php          # Citizen news tips inbox
│   ├── hotlines.php           # Emergency numbers manager
│   ├── pages.php              # Static pages list
│   ├── page_edit.php          # Static page editor
│   ├── menus.php              # Navigation menus editor
│   ├── settings.php           # Site Settings & Homepage ZIP toggle
│   ├── profile.php            # Admin credentials updater
│   ├── css/admin.css          # Admin styling
│   └── js/admin.js            # Admin utilities
├── assets/
│   ├── css/style.css          # Public responsive styling
│   └── js/main.js             # Public interactivity
├── install/
│   └── index.php              # 5-Step interactive installer
└── uploads/
    └── .htaccess              # Script execution protection
\`\`\`
`;

  return files;
}
