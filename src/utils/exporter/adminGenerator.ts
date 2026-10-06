export function generateAdminTemplates(): Record<string, string> {
  const adminFiles: Record<string, string> = {};

  // admin/header.php
  adminFiles['admin/header.php'] = `<?php
/**
 * Zunheboto Social — Admin CMS Header & Sidebar Navigation
 */
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';
require_admin_auth();

$siteName = get_setting('site_name', 'Zunheboto Social');
$adminUser = $_SESSION['zs_admin_name'] ?? 'Administrator';
$currentPage = basename($_SERVER['PHP_SELF'], '.php');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= isset($pageTitle) ? sanitize($pageTitle) . ' — ' : '' ?>CMS Control Panel | <?= sanitize($siteName) ?></title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/admin/css/admin.css">
</head>
<body class="zs-admin-body">

<div class="zs-admin-wrapper">
    <!-- Sidebar Navigation -->
    <aside class="zs-admin-sidebar">
        <div class="zs-sidebar-brand">
            <a href="/admin">
                <span class="zs-brand-icon">⚡</span>
                <div class="zs-brand-info">
                    <strong><?= sanitize($siteName) ?></strong>
                    <span class="zs-version-badge">Standalone PHP CMS</span>
                </div>
            </a>
        </div>

        <nav class="zs-admin-nav">
            <div class="zs-nav-group">
                <span class="zs-nav-label">Core Content</span>
                <a href="/admin/index.php" class="zs-nav-link <?= $currentPage === 'index' ? 'active' : '' ?>">📊 Dashboard</a>
                <a href="/admin/articles.php" class="zs-nav-link <?= in_array($currentPage, ['articles', 'article_edit']) ? 'active' : '' ?>">📰 Articles &amp; News</a>
                <a href="/admin/categories.php" class="zs-nav-link <?= $currentPage === 'categories' ? 'active' : '' ?>">🏷️ Article Categories</a>
                <a href="/admin/homepage_builder.php" class="zs-nav-link <?= $currentPage === 'homepage_builder' ? 'active' : '' ?>">🏗️ Homepage Builder</a>
            </div>

            <div class="zs-nav-group">
                <span class="zs-nav-label">District Directory &amp; Media</span>
                <a href="/admin/listings.php" class="zs-nav-link <?= in_array($currentPage, ['listings', 'listing_edit']) ? 'active' : '' ?>">🏢 Directory Listings</a>
                <a href="/admin/listing_categories.php" class="zs-nav-link <?= $currentPage === 'listing_categories' ? 'active' : '' ?>">🗂️ Directory Categories</a>
                <a href="/admin/gallery.php" class="zs-nav-link <?= $currentPage === 'gallery' ? 'active' : '' ?>">📸 Photo Gallery</a>
                <a href="/admin/media.php" class="zs-nav-link <?= $currentPage === 'media' ? 'active' : '' ?>">🖼️ Media Library</a>
            </div>

            <div class="zs-nav-group">
                <span class="zs-nav-label">Civic &amp; Communications</span>
                <a href="/admin/news_tips.php" class="zs-nav-link <?= $currentPage === 'news_tips' ? 'active' : '' ?>">📢 Citizen News Tips</a>
                <a href="/admin/hotlines.php" class="zs-nav-link <?= $currentPage === 'hotlines' ? 'active' : '' ?>">🚨 Emergency Hotlines</a>
                <a href="/admin/pages.php" class="zs-nav-link <?= in_array($currentPage, ['pages', 'page_edit']) ? 'active' : '' ?>">📄 Static Pages</a>
                <a href="/admin/menus.php" class="zs-nav-link <?= $currentPage === 'menus' ? 'active' : '' ?>">🧭 Navigation Menus</a>
            </div>

            <div class="zs-nav-group">
                <span class="zs-nav-label">Administration</span>
                <a href="/admin/settings.php" class="zs-nav-link <?= $currentPage === 'settings' ? 'active' : '' ?>">⚙️ Site Settings &amp; Branding</a>
                <a href="/admin/backup.php" class="zs-nav-link <?= $currentPage === 'backup' ? 'active' : '' ?>">💾 Database Backup &amp; Export</a>
                <a href="/admin/profile.php" class="zs-nav-link <?= $currentPage === 'profile' ? 'active' : '' ?>">👤 Administrator Profile</a>
            </div>
        </nav>

        <div class="zs-sidebar-footer">
            <a href="/" target="_blank" class="zs-btn-view-site">🌐 View Live Website &rarr;</a>
            <a href="/admin/logout.php" class="zs-btn-logout">🚪 Logout</a>
        </div>
    </aside>

    <!-- Main Content Canvas -->
    <div class="zs-admin-main">
        <header class="zs-admin-topbar">
            <div class="zs-topbar-breadcrumb">
                <span class="zs-bc-root">Admin Desk</span>
                <span class="zs-bc-sep">/</span>
                <span class="zs-bc-current"><?= isset($pageTitle) ? sanitize($pageTitle) : 'Overview' ?></span>
            </div>
            <div class="zs-topbar-user">
                <span class="zs-user-name">👤 <?= sanitize($adminUser) ?></span>
            </div>
        </header>

        <div class="zs-admin-body-inner">
`;

  // admin/footer.php
  adminFiles['admin/footer.php'] = `
        </div> <!-- end .zs-admin-body-inner -->
        <footer class="zs-admin-footer">
            <span>Zunheboto Social CMS &bull; Production Engine PHP 8.2+</span>
            <span>Server: <?= sanitize($_SERVER['SERVER_SOFTWARE'] ?? 'LiteSpeed / Apache') ?></span>
        </footer>
    </div> <!-- end .zs-admin-main -->
</div> <!-- end .zs-admin-wrapper -->

<script src="/admin/js/admin.js"></script>
</body>
</html>
`;

  // admin/index.php
  adminFiles['admin/index.php'] = `<?php
/**
 * Zunheboto Social — Admin Dashboard
 */
$pageTitle = 'Dashboard Overview';
require_once __DIR__ . '/header.php';
$db = get_db_connection();

$totalArticles = $db ? $db->query("SELECT COUNT(*) FROM zs_articles")->fetchColumn() : 0;
$totalListings = $db ? $db->query("SELECT COUNT(*) FROM zs_listings")->fetchColumn() : 0;
$totalTips = $db ? $db->query("SELECT COUNT(*) FROM zs_news_tips WHERE status = 'unread'") : null;
$unreadTipsCount = $totalTips ? $totalTips->fetchColumn() : 0;
$totalViews = $db ? $db->query("SELECT SUM(views) FROM zs_articles")->fetchColumn() : 0;

$recentArticles = $db ? $db->query("SELECT * FROM zs_articles ORDER BY created_at DESC LIMIT 5")->fetchAll() : [];
$recentTips = $db ? $db->query("SELECT * FROM zs_news_tips ORDER BY created_at DESC LIMIT 5")->fetchAll() : [];
?>

<div class="zs-dashboard">
    <!-- Stat Metric Cards -->
    <div class="zs-stats-grid">
        <div class="zs-stat-card">
            <span class="zs-stat-icon" style="background:#e0f2fe;color:#0284c7">📰</span>
            <div class="zs-stat-data">
                <span class="zs-stat-number"><?= (int)$totalArticles ?></span>
                <span class="zs-stat-label">Published Articles</span>
            </div>
        </div>

        <div class="zs-stat-card">
            <span class="zs-stat-icon" style="background:#fef3c7;color:#d97706">🏢</span>
            <div class="zs-stat-data">
                <span class="zs-stat-number"><?= (int)$totalListings ?></span>
                <span class="zs-stat-label">Directory Listings</span>
            </div>
        </div>

        <div class="zs-stat-card">
            <span class="zs-stat-icon" style="background:#fee2e2;color:#dc2626">📢</span>
            <div class="zs-stat-data">
                <span class="zs-stat-number"><?= (int)$unreadTipsCount ?></span>
                <span class="zs-stat-label">Unread Citizen News Tips</span>
            </div>
        </div>

        <div class="zs-stat-card">
            <span class="zs-stat-icon" style="background:#dcfce7;color:#16a34a">👁️</span>
            <div class="zs-stat-data">
                <span class="zs-stat-number"><?= number_format((int)$totalViews) ?></span>
                <span class="zs-stat-label">Total News Article Views</span>
            </div>
        </div>
    </div>

    <!-- Quick Action Bar -->
    <div class="zs-quick-actions">
        <h3>⚡ Quick Operations</h3>
        <div class="zs-action-btns">
            <a href="/admin/article_edit.php" class="zs-btn-action">✍️ Write New Article</a>
            <a href="/admin/listing_edit.php" class="zs-btn-action">🏢 Add Directory Listing</a>
            <a href="/admin/homepage_builder.php" class="zs-btn-action">🏗️ Edit Homepage Layout</a>
            <a href="/admin/media.php" class="zs-btn-action">🖼️ Upload Media</a>
            <a href="/admin/settings.php" class="zs-btn-action">⚙️ Site Branding</a>
        </div>
    </div>

    <!-- Dual Table Overview -->
    <div class="zs-dash-grid">
        <!-- Recent Articles -->
        <div class="zs-dash-panel">
            <div class="zs-panel-header">
                <h3>Latest Articles</h3>
                <a href="/admin/articles.php" class="zs-link-sm">View All &rarr;</a>
            </div>
            <table class="zs-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Views</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($recentArticles as $ra): ?>
                    <tr>
                        <td><strong><a href="/admin/article_edit.php?id=<?= $ra['id'] ?>"><?= sanitize($ra['title']) ?></a></strong></td>
                        <td><span class="zs-badge-status zs-status-<?= $ra['status'] ?>"><?= ucfirst($ra['status']) ?></span></td>
                        <td><?= (int)$ra['views'] ?></td>
                        <td><?= date('M j, Y', strtotime($ra['published_at'] ?? $ra['created_at'])) ?></td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>

        <!-- Recent Citizen Tips -->
        <div class="zs-dash-panel">
            <div class="zs-panel-header">
                <h3>Citizen News Tips Inbox</h3>
                <a href="/admin/news_tips.php" class="zs-link-sm">View Inbox &rarr;</a>
            </div>
            <table class="zs-table">
                <thead>
                    <tr>
                        <th>Sender</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Received</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($recentTips as $rt): ?>
                    <tr>
                        <td><?= sanitize($rt['sender_name'] ?: 'Anonymous') ?> (<?= sanitize($rt['sender_contact']) ?>)</td>
                        <td><?= sanitize($rt['location'] ?: 'Zunheboto') ?></td>
                        <td><span class="zs-badge-status zs-tip-<?= $rt['status'] ?>"><?= ucfirst($rt['status']) ?></span></td>
                        <td><?= date('M j, g:ia', strtotime($rt['created_at'])) ?></td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/footer.php'; ?>
`;

  // admin/login.php
  adminFiles['admin/login.php'] = `<?php
/**
 * Zunheboto Social — Admin Login Portal
 */
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';

$error = '';
$siteName = get_setting('site_name', 'Zunheboto Social');

if (is_admin_logged_in()) {
    header("Location: /admin/index.php");
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $csrf = $_POST['csrf_token'] ?? '';
    if (!verify_csrf_token($csrf)) {
        $error = 'Security token expired. Please reload and try again.';
    } else {
        $username = trim($_POST['username'] ?? '');
        $password = trim($_POST['password'] ?? '');
        
        if (empty($username) || empty($password)) {
            $error = 'Please enter both username and password.';
        } else {
            $db = get_db_connection();
            if ($db) {
                $stmt = $db->prepare("SELECT * FROM zs_users WHERE username = ? OR email = ? LIMIT 1");
                $stmt->execute([$username, $username]);
                $user = $stmt->fetch();
                
                if ($user && password_verify($password, $user['password_hash'])) {
                    session_regenerate_id(true);
                    $_SESSION['zs_admin_id'] = $user['id'];
                    $_SESSION['zs_admin_name'] = $user['name'];
                    $_SESSION['zs_admin_email'] = $user['email'];
                    $_SESSION['zs_admin_role'] = $user['role'];
                    
                    header("Location: /admin/index.php");
                    exit;
                } else {
                    $error = 'Invalid administrative credentials. Please verify your username and password.';
                }
            } else {
                $error = 'Database connection failure. Please verify config.php.';
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login &bull; <?= sanitize($siteName) ?></title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Lora:wght@600;700&display=swap" rel="stylesheet">
    <style>
        *{box-sizing:border-box}
        body{margin:0;font-family:'Plus Jakarta Sans',sans-serif;background:#0b192c;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
        .login-box{background:#fff;border-radius:14px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);width:100%;max-width:440px;overflow:hidden}
        .login-head{background:#0b192c;padding:32px 28px;text-align:center;color:#fff;border-bottom:3px solid #d97706}
        .login-head h1{font-family:'Lora',serif;margin:0 0 6px 0;font-size:24px;letter-spacing:1px}
        .login-head p{margin:0;color:#94a3b8;font-size:13px}
        .login-body{padding:32px 28px}
        .form-group{margin-bottom:20px}
        .form-group label{display:block;font-size:13px;font-weight:600;color:#334155;margin-bottom:6px}
        .form-control{width:100%;padding:12px 14px;border:1px solid #cbd5e1;border-radius:8px;font-size:14px}
        .form-control:focus{border-color:#0284c7;outline:none;box-shadow:0 0 0 3px rgba(2,132,199,0.15)}
        .btn-login{width:100%;background:#0b192c;color:#fff;border:none;padding:14px;border-radius:8px;font-weight:700;font-size:14px;cursor:pointer;transition:all 0.2s}
        .btn-login:hover{background:#1e293b}
        .alert-error{background:#fef2f2;border:1px solid #fecaca;color:#991b1b;padding:12px 14px;border-radius:8px;font-size:13px;margin-bottom:20px}
        .back-link{display:block;text-align:center;margin-top:20px;font-size:13px;color:#64748b;text-decoration:none}
        .back-link:hover{color:#0b192c}
    </style>
</head>
<body>
<div class="login-box">
    <div class="login-head">
        <h1><?= sanitize($siteName) ?></h1>
        <p>Administrative CMS Login Portal</p>
    </div>
    <div class="login-body">
        <?php if ($error): ?>
            <div class="alert-error"><?= sanitize($error) ?></div>
        <?php endif; ?>
        <form method="POST">
            <input type="hidden" name="csrf_token" value="<?= generate_csrf_token() ?>">
            <div class="form-group">
                <label>Username or Email Address</label>
                <input type="text" name="username" class="form-control" placeholder="administrator" required autofocus>
            </div>
            <div class="form-group">
                <label>Password</label>
                <input type="password" name="password" class="form-control" placeholder="••••••••" required>
            </div>
            <button type="submit" class="btn-login">Sign In to Dashboard &rarr;</button>
        </form>
        <a href="/" class="back-link">&larr; Return to Public Website</a>
    </div>
</div>
</body>
</html>
`;

  // admin/logout.php
  adminFiles['admin/logout.php'] = `<?php
require_once __DIR__ . '/../includes/functions.php';
$_SESSION = [];
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}
session_destroy();
header("Location: /admin/login.php");
exit;
`;

  // admin/articles.php
  adminFiles['admin/articles.php'] = `<?php
/**
 * Zunheboto Social — Articles Management
 */
$pageTitle = 'Articles & News Desk';
require_once __DIR__ . '/header.php';
$db = get_db_connection();

$search = trim($_GET['search'] ?? '');
$filterCat = trim($_GET['cat'] ?? '');
$filterStatus = trim($_GET['status'] ?? '');

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'delete' && !empty($_POST['id'])) {
    if (verify_csrf_token($_POST['csrf_token'] ?? '')) {
        if ($db) {
            $dStmt = $db->prepare("DELETE FROM zs_articles WHERE id = ?");
            $dStmt->execute([$_POST['id']]);
            header("Location: /admin/articles.php?deleted=1");
            exit;
        }
    }
}

$sql = "SELECT a.*, c.name as cat_name FROM zs_articles a LEFT JOIN zs_article_categories c ON a.category_id = c.id WHERE 1=1";
$params = [];
if ($search) {
    $sql .= " AND (a.title LIKE ? OR a.content LIKE ?)";
    $params[] = "%$search%";
    $params[] = "%$search%";
}
if ($filterCat) {
    $sql .= " AND a.category_id = ?";
    $params[] = $filterCat;
}
if ($filterStatus) {
    $sql .= " AND a.status = ?";
    $params[] = $filterStatus;
}
$sql .= " ORDER BY a.created_at DESC";

$stmt = $db ? $db->prepare($sql) : null;
$articles = [];
if ($stmt) {
    $stmt->execute($params);
    $articles = $stmt->fetchAll();
}

$cats = $db ? $db->query("SELECT * FROM zs_article_categories ORDER BY name ASC")->fetchAll() : [];
?>

<div class="zs-content-panel">
    <div class="zs-panel-top">
        <div>
            <h2>News &amp; Article Archive</h2>
            <p>Manage, draft, publish, and assign categories to district news reports.</p>
        </div>
        <a href="/admin/article_edit.php" class="zs-btn-primary">+ Create New Article</a>
    </div>

    <!-- Filters Bar -->
    <form method="GET" class="zs-filter-form">
        <input type="text" name="search" value="<?= sanitize($search) ?>" placeholder="Search headline..." class="zs-input-sm">
        <select name="cat" class="zs-input-sm">
            <option value="">All Categories</option>
            <?php foreach ($cats as $c): ?>
                <option value="<?= $c['id'] ?>" <?= $filterCat == $c['id'] ? 'selected' : '' ?>><?= sanitize($c['name']) ?></option>
            <?php endforeach; ?>
        </select>
        <select name="status" class="zs-input-sm">
            <option value="">All Statuses</option>
            <option value="published" <?= $filterStatus === 'published' ? 'selected' : '' ?>>Published</option>
            <option value="draft" <?= $filterStatus === 'draft' ? 'selected' : '' ?>>Draft</option>
            <option value="unpublished" <?= $filterStatus === 'unpublished' ? 'selected' : '' ?>>Unpublished</option>
        </select>
        <button type="submit" class="zs-btn-action">Filter</button>
        <?php if ($search || $filterCat || $filterStatus): ?>
            <a href="/admin/articles.php" class="zs-btn-reset">Reset</a>
        <?php endif; ?>
    </form>

    <?php if (isset($_GET['deleted'])): ?><div class="zs-alert-ok">Article deleted successfully!</div><?php endif; ?>

    <table class="zs-table">
        <thead>
            <tr>
                <th width="80">Thumbnail</th>
                <th>Headline</th>
                <th>Category</th>
                <th>Author</th>
                <th>Status</th>
                <th>Views</th>
                <th>Date</th>
                <th width="140">Actions</th>
            </tr>
        </thead>
        <tbody>
            <?php if (!empty($articles)): ?>
                <?php foreach ($articles as $a): ?>
                <tr>
                    <td>
                        <img src="<?= sanitize($a['featured_image']) ?>" alt="" style="width:60px;height:40px;object-fit:cover;border-radius:4px">
                    </td>
                    <td>
                        <strong><a href="/admin/article_edit.php?id=<?= $a['id'] ?>"><?= sanitize($a['title']) ?></a></strong>
                        <?php if ($a['is_featured']): ?>
                            <span class="zs-tag-feat">★ Featured Lead</span>
                        <?php endif; ?>
                    </td>
                    <td><?= sanitize($a['cat_name'] ?? 'Uncategorized') ?></td>
                    <td><?= sanitize($a['author_name']) ?></td>
                    <td><span class="zs-badge-status zs-status-<?= $a['status'] ?>"><?= ucfirst($a['status']) ?></span></td>
                    <td><?= (int)$a['views'] ?></td>
                    <td><?= date('M j, Y', strtotime($a['published_at'] ?? $a['created_at'])) ?></td>
                    <td>
                        <div style="display:flex;gap:6px;align-items:center">
                            <a href="/admin/article_edit.php?id=<?= $a['id'] ?>" class="zs-btn-sm-edit">Edit</a>
                            <form method="POST" onsubmit="return confirm('Delete this article?')" style="display:inline">
                                <input type="hidden" name="action" value="delete">
                                <input type="hidden" name="id" value="<?= $a['id'] ?>">
                                <input type="hidden" name="csrf_token" value="<?= generate_csrf_token() ?>">
                                <button type="submit" class="zs-btn-sm-del" style="border:none;cursor:pointer">Delete</button>
                            </form>
                        </div>
                    </td>
                </tr>
                <?php endforeach; ?>
            <?php else: ?>
                <tr><td colspan="8" class="zs-td-empty">No articles found matching filters.</td></tr>
            <?php endif; ?>
        </tbody>
    </table>
</div>

<?php require_once __DIR__ . '/footer.php'; ?>
`;

  // admin/article_edit.php
  adminFiles['admin/article_edit.php'] = `<?php
/**
 * Zunheboto Social — Article Editor
 */
$id = $_GET['id'] ?? '';
$isEdit = !empty($id);
$pageTitle = $isEdit ? 'Edit Article' : 'Write New Article';
require_once __DIR__ . '/header.php';
$db = get_db_connection();

$error = '';
$success = '';

// Load categories
$cats = $db ? $db->query("SELECT * FROM zs_article_categories ORDER BY name ASC")->fetchAll() : [];

$article = [
    'title' => '',
    'slug' => '',
    'excerpt' => '',
    'content' => '',
    'featured_image' => 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800',
    'category_id' => $cats[0]['id'] ?? '',
    'author_name' => $_SESSION['zs_admin_name'] ?? 'Staff Reporter',
    'status' => 'published',
    'is_featured' => 0,
    'read_time_minutes' => 3,
    'seo_title' => '',
    'meta_description' => '',
    'tags' => ''
];

if ($isEdit && $db) {
    $stmt = $db->prepare("SELECT * FROM zs_articles WHERE id = ?");
    $stmt->execute([$id]);
    $found = $stmt->fetch();
    if ($found) {
        $article = $found;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verify_csrf_token($_POST['csrf_token'] ?? '')) {
        $error = 'Security validation failed. Please try again.';
    } else {
        $title = trim($_POST['title'] ?? '');
        $slug = slugify(trim($_POST['slug'] ?? '') ?: $title);
        $excerpt = trim($_POST['excerpt'] ?? '');
        $content = trim($_POST['content'] ?? '');
        $featured_image = trim($_POST['featured_image'] ?? '');
        $category_id = trim($_POST['category_id'] ?? '');
        $author_name = trim($_POST['author_name'] ?? 'Staff Reporter');
        $status = trim($_POST['status'] ?? 'published');
        $is_featured = isset($_POST['is_featured']) ? 1 : 0;
        $read_time_minutes = (int)($_POST['read_time_minutes'] ?? 3);
        $seo_title = trim($_POST['seo_title'] ?? '') ?: $title;
        $meta_description = trim($_POST['meta_description'] ?? '') ?: $excerpt;
        $tags = trim($_POST['tags'] ?? '');

        if (empty($title) || empty($content)) {
            $error = 'Headline and full article content are required.';
        } else {
            if ($db) {
                if ($isEdit) {
                    $uStmt = $db->prepare("UPDATE zs_articles SET title=?, slug=?, excerpt=?, content=?, featured_image=?, category_id=?, author_name=?, status=?, is_featured=?, read_time_minutes=?, seo_title=?, meta_description=?, tags=?, updated_at=NOW() WHERE id=?");
                    $uStmt->execute([$title, $slug, $excerpt, $content, $featured_image, $category_id, $author_name, $status, $is_featured, $read_time_minutes, $seo_title, $meta_description, $tags, $id]);
                    $success = 'Article updated successfully!';
                    $article = array_merge($article, [
                        'title' => $title, 'slug' => $slug, 'excerpt' => $excerpt, 'content' => $content,
                        'featured_image' => $featured_image, 'category_id' => $category_id, 'author_name' => $author_name,
                        'status' => $status, 'is_featured' => $is_featured, 'read_time_minutes' => $read_time_minutes,
                        'seo_title' => $seo_title, 'meta_description' => $meta_description, 'tags' => $tags
                    ]);
                } else {
                    $newId = 'art_' . time() . '_' . rand(100, 999);
                    $iStmt = $db->prepare("INSERT INTO zs_articles (id, title, slug, excerpt, content, featured_image, category_id, author_name, status, is_featured, read_time_minutes, seo_title, meta_description, tags, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");
                    $iStmt->execute([$newId, $title, $slug, $excerpt, $content, $featured_image, $category_id, $author_name, $status, $is_featured, $read_time_minutes, $seo_title, $meta_description, $tags]);
                    header("Location: /admin/article_edit.php?id=" . $newId . "&created=1");
                    exit;
                }
            }
        }
    }
}
?>

<div class="zs-content-panel">
    <div class="zs-panel-top">
        <div>
            <h2><?= $isEdit ? 'Edit Article' : 'Write New Article' ?></h2>
            <p>Publish breaking stories, local investigative pieces, and district announcements.</p>
        </div>
        <a href="/admin/articles.php" class="zs-btn-reset">&larr; Back to Articles</a>
    </div>

    <?php if ($error): ?><div class="zs-alert-err"><?= sanitize($error) ?></div><?php endif; ?>
    <?php if ($success || isset($_GET['created'])): ?><div class="zs-alert-ok">Article saved successfully!</div><?php endif; ?>

    <form method="POST" class="zs-form-grid">
        <input type="hidden" name="csrf_token" value="<?= generate_csrf_token() ?>">
        <div class="zs-form-main">
            <div class="zs-form-group">
                <label>Article Headline / Title *</label>
                <input type="text" name="title" value="<?= sanitize($article['title']) ?>" class="zs-input" placeholder="e.g. Zunheboto District Hospital Receives Modern Diagnostic Wing" required>
            </div>

            <div class="zs-form-group">
                <label>Slug / URL Permalink</label>
                <input type="text" name="slug" value="<?= sanitize($article['slug']) ?>" class="zs-input" placeholder="auto-generated-from-title">
            </div>

            <div class="zs-form-group">
                <label>Short Excerpt / Summary</label>
                <textarea name="excerpt" class="zs-textarea" rows="3" placeholder="Brief summary of the news story for homepage cards and previews..."><?= sanitize($article['excerpt']) ?></textarea>
            </div>

            <div class="zs-form-group">
                <label>Full Article Content (Markdown / Text) *</label>
                <textarea name="content" class="zs-textarea" rows="16" placeholder="Write the full report here..." required><?= sanitize($article['content']) ?></textarea>
            </div>

            <div class="zs-form-group">
                <label>Article Tags (comma separated)</label>
                <input type="text" name="tags" value="<?= sanitize($article['tags'] ?? '') ?>" class="zs-input" placeholder="hospital, healthcare, zunheboto, development">
            </div>
        </div>

        <div class="zs-form-side">
            <div class="zs-side-box">
                <h4>Publishing Controls</h4>
                <div class="zs-form-group">
                    <label>Publication Status</label>
                    <select name="status" class="zs-input">
                        <option value="published" <?= $article['status'] === 'published' ? 'selected' : '' ?>>Published</option>
                        <option value="draft" <?= $article['status'] === 'draft' ? 'selected' : '' ?>>Draft</option>
                        <option value="unpublished" <?= $article['status'] === 'unpublished' ? 'selected' : '' ?>>Unpublished</option>
                    </select>
                </div>

                <div class="zs-form-group">
                    <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
                        <input type="checkbox" name="is_featured" value="1" <?= $article['is_featured'] ? 'checked' : '' ?>>
                        <strong>Feature as Main Hero Story</strong>
                    </label>
                </div>

                <div class="zs-form-group">
                    <label>Category</label>
                    <select name="category_id" class="zs-input">
                        <?php foreach ($cats as $c): ?>
                            <option value="<?= $c['id'] ?>" <?= $article['category_id'] == $c['id'] ? 'selected' : '' ?>><?= sanitize($c['name']) ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>

                <div class="zs-form-group">
                    <label>Author Byline</label>
                    <input type="text" name="author_name" value="<?= sanitize($article['author_name']) ?>" class="zs-input">
                </div>

                <div class="zs-form-group">
                    <label>Estimated Read Time (Minutes)</label>
                    <input type="number" name="read_time_minutes" value="<?= (int)$article['read_time_minutes'] ?>" class="zs-input" min="1">
                </div>

                <button type="submit" class="zs-btn-primary" style="width:100%;margin-top:10px">Save Article &rarr;</button>
            </div>

            <div class="zs-side-box" style="margin-top:20px">
                <h4>Featured Image</h4>
                <input type="text" name="featured_image" value="<?= sanitize($article['featured_image']) ?>" class="zs-input" placeholder="https://image-url.jpg">
                <?php if ($article['featured_image']): ?>
                    <img src="<?= sanitize($article['featured_image']) ?>" style="width:100%;height:140px;object-fit:cover;border-radius:6px;margin-top:10px">
                <?php endif; ?>
            </div>

            <div class="zs-side-box" style="margin-top:20px">
                <h4>Search Engine Optimization (SEO)</h4>
                <div class="zs-form-group">
                    <label>SEO Title</label>
                    <input type="text" name="seo_title" value="<?= sanitize($article['seo_title'] ?? '') ?>" class="zs-input" placeholder="Custom meta title">
                </div>
                <div class="zs-form-group">
                    <label>Meta Description</label>
                    <textarea name="meta_description" class="zs-textarea" rows="2" placeholder="Custom meta description"><?= sanitize($article['meta_description'] ?? '') ?></textarea>
                </div>
            </div>
        </div>
    </form>
</div>

<?php require_once __DIR__ . '/footer.php'; ?>
`;

  // admin/categories.php
  adminFiles['admin/categories.php'] = `<?php
/**
 * Zunheboto Social — Article Categories CRUD
 */
$pageTitle = 'Article Categories';
require_once __DIR__ . '/header.php';
$db = get_db_connection();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (verify_csrf_token($_POST['csrf_token'] ?? '')) {
        $action = $_POST['action'] ?? '';
        if ($action === 'add') {
            $name = trim($_POST['name'] ?? '');
            $slug = slugify(trim($_POST['slug'] ?? '') ?: $name);
            $color = trim($_POST['color'] ?? '#0284c7');
            $desc = trim($_POST['description'] ?? '');

            if ($name && $db) {
                $newId = 'cat_' . time();
                $stmt = $db->prepare("INSERT INTO zs_article_categories (id, name, slug, description, color) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([$newId, $name, $slug, $desc, $color]);
                header("Location: /admin/categories.php?added=1");
                exit;
            }
        } elseif ($action === 'delete') {
            $delId = trim($_POST['id'] ?? '');
            if ($delId && $db) {
                $stmt = $db->prepare("DELETE FROM zs_article_categories WHERE id = ?");
                $stmt->execute([$delId]);
                header("Location: /admin/categories.php?deleted=1");
                exit;
            }
        }
    }
}

$categories = $db ? $db->query("SELECT c.*, COUNT(a.id) as art_count FROM zs_article_categories c LEFT JOIN zs_articles a ON c.id = a.category_id GROUP BY c.id ORDER BY c.sort_order ASC")->fetchAll() : [];
?>

<div class="zs-dash-grid">
    <div class="zs-content-panel">
        <h3>Article Categories</h3>
        <?php if (isset($_GET['added'])): ?><div class="zs-alert-ok">Category created successfully!</div><?php endif; ?>
        <?php if (isset($_GET['deleted'])): ?><div class="zs-alert-ok">Category deleted!</div><?php endif; ?>
        <table class="zs-table">
            <thead>
                <tr>
                    <th>Color</th>
                    <th>Name</th>
                    <th>Slug</th>
                    <th>Articles</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($categories as $cat): ?>
                <tr>
                    <td><span style="display:inline-block;width:16px;height:16px;border-radius:4px;background:<?= sanitize($cat['color']) ?>"></span></td>
                    <td><strong><?= sanitize($cat['name']) ?></strong></td>
                    <td><code><?= sanitize($cat['slug']) ?></code></td>
                    <td><?= (int)$cat['art_count'] ?></td>
                    <td>
                        <form method="POST" onsubmit="return confirm('Delete this category?')" style="display:inline">
                            <input type="hidden" name="action" value="delete">
                            <input type="hidden" name="id" value="<?= $cat['id'] ?>">
                            <input type="hidden" name="csrf_token" value="<?= generate_csrf_token() ?>">
                            <button type="submit" class="zs-btn-sm-del" style="border:none;cursor:pointer">Delete</button>
                        </form>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>

    <div class="zs-content-panel">
        <h3>+ Add Category</h3>
        <form method="POST">
            <input type="hidden" name="action" value="add">
            <input type="hidden" name="csrf_token" value="<?= generate_csrf_token() ?>">
            <div class="zs-form-group">
                <label>Category Name *</label>
                <input type="text" name="name" class="zs-input" placeholder="e.g. Governance & Policy" required>
            </div>
            <div class="zs-form-group">
                <label>Slug</label>
                <input type="text" name="slug" class="zs-input" placeholder="governance-policy">
            </div>
            <div class="zs-form-group">
                <label>Color Badge</label>
                <input type="color" name="color" value="#0284c7" class="zs-input" style="height:44px;padding:4px">
            </div>
            <div class="zs-form-group">
                <label>Description</label>
                <textarea name="description" class="zs-textarea" rows="3"></textarea>
            </div>
            <button type="submit" class="zs-btn-primary" style="width:100%">Create Category</button>
        </form>
    </div>
</div>

<?php require_once __DIR__ . '/footer.php'; ?>
`;

  // admin/listings.php
  adminFiles['admin/listings.php'] = `<?php
/**
 * Zunheboto Social — Directory Listings Management
 */
$pageTitle = 'Directory Listings Desk';
require_once __DIR__ . '/header.php';
$db = get_db_connection();

$search = trim($_GET['search'] ?? '');
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'delete' && !empty($_POST['id'])) {
    if (verify_csrf_token($_POST['csrf_token'] ?? '')) {
        if ($db) {
            $stmt = $db->prepare("DELETE FROM zs_listings WHERE id = ?");
            $stmt->execute([$_POST['id']]);
            header("Location: /admin/listings.php?deleted=1");
            exit;
        }
    }
}

$sql = "SELECT l.*, c.name as cat_name FROM zs_listings l LEFT JOIN zs_listing_categories c ON l.category_id = c.id WHERE 1=1";
$params = [];
if ($search) {
    $sql .= " AND (l.name LIKE ? OR l.address LIKE ? OR l.phone LIKE ?)";
    $params[] = "%$search%";
    $params[] = "%$search%";
    $params[] = "%$search%";
}
$sql .= " ORDER BY l.verified DESC, l.name ASC";
$stmt = $db ? $db->prepare($sql) : null;
$listings = [];
if ($stmt) {
    $stmt->execute($params);
    $listings = $stmt->fetchAll();
}
?>

<div class="zs-content-panel">
    <div class="zs-panel-top">
        <div>
            <h2>Directory Listings</h2>
            <p>Verified public contacts, healthcare, businesses, and essential local services in Zunheboto.</p>
        </div>
        <a href="/admin/listing_edit.php" class="zs-btn-primary">+ Add Directory Listing</a>
    </div>

    <?php if (isset($_GET['deleted'])): ?><div class="zs-alert-ok">Listing deleted successfully!</div><?php endif; ?>

    <table class="zs-table">
        <thead>
            <tr>
                <th width="60">Photo</th>
                <th>Establishment Name</th>
                <th>Category</th>
                <th>Phone</th>
                <th>Area</th>
                <th>Status</th>
                <th>Verified</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($listings as $l): ?>
            <tr>
                <td><img src="<?= sanitize($l['featured_image']) ?>" style="width:50px;height:36px;object-fit:cover;border-radius:4px"></td>
                <td><strong><a href="/admin/listing_edit.php?id=<?= $l['id'] ?>"><?= sanitize($l['name']) ?></a></strong></td>
                <td><?= sanitize($l['cat_name'] ?? 'General') ?></td>
                <td><?= sanitize($l['phone']) ?></td>
                <td><?= sanitize($l['location_area']) ?></td>
                <td><span class="zs-badge-status zs-status-<?= $l['status'] ?>"><?= ucfirst($l['status']) ?></span></td>
                <td><?= $l['verified'] ? '✅ Verified' : '—' ?></td>
                <td>
                    <div style="display:flex;gap:6px;align-items:center">
                        <a href="/admin/listing_edit.php?id=<?= $l['id'] ?>" class="zs-btn-sm-edit">Edit</a>
                        <form method="POST" onsubmit="return confirm('Delete this listing?')" style="display:inline">
                            <input type="hidden" name="action" value="delete">
                            <input type="hidden" name="id" value="<?= $l['id'] ?>">
                            <input type="hidden" name="csrf_token" value="<?= generate_csrf_token() ?>">
                            <button type="submit" class="zs-btn-sm-del" style="border:none;cursor:pointer">Delete</button>
                        </form>
                    </div>
                </td>
            </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
</div>

<?php require_once __DIR__ . '/footer.php'; ?>
`;

  // admin/listing_edit.php
  adminFiles['admin/listing_edit.php'] = `<?php
/**
 * Zunheboto Social — Directory Listing Editor
 */
$id = $_GET['id'] ?? '';
$isEdit = !empty($id);
$pageTitle = $isEdit ? 'Edit Directory Listing' : 'Add Directory Listing';
require_once __DIR__ . '/header.php';
$db = get_db_connection();

$error = '';
$cats = $db ? $db->query("SELECT * FROM zs_listing_categories ORDER BY name ASC")->fetchAll() : [];

$listing = [
    'name' => '',
    'slug' => '',
    'category_id' => $cats[0]['id'] ?? '',
    'description' => '',
    'featured_image' => 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800',
    'address' => 'Project Colony, Zunheboto, Nagaland',
    'location_area' => 'Project Colony',
    'phone' => '+91 3867 220 000',
    'email' => '',
    'website' => '',
    'whatsapp' => '',
    'opening_hours' => 'Mon–Sat: 9:00 AM – 5:00 PM',
    'verified' => 1,
    'status' => 'published'
];

if ($isEdit && $db) {
    $stmt = $db->prepare("SELECT * FROM zs_listings WHERE id = ?");
    $stmt->execute([$id]);
    $found = $stmt->fetch();
    if ($found) $listing = $found;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verify_csrf_token($_POST['csrf_token'] ?? '')) {
        $error = 'Security check failed. Please refresh and try again.';
    } else {
        $name = trim($_POST['name'] ?? '');
        $slug = slugify(trim($_POST['slug'] ?? '') ?: $name);
        $category_id = trim($_POST['category_id'] ?? '');
        $description = trim($_POST['description'] ?? '');
        $featured_image = trim($_POST['featured_image'] ?? '');
        $address = trim($_POST['address'] ?? '');
        $location_area = trim($_POST['location_area'] ?? '');
        $phone = trim($_POST['phone'] ?? '');
        $email = trim($_POST['email'] ?? '');
        $website = trim($_POST['website'] ?? '');
        $whatsapp = trim($_POST['whatsapp'] ?? '');
        $opening_hours = trim($_POST['opening_hours'] ?? '');
        $verified = isset($_POST['verified']) ? 1 : 0;
        $status = trim($_POST['status'] ?? 'published');

        if ($name && $phone && $db) {
            if ($isEdit) {
                $uStmt = $db->prepare("UPDATE zs_listings SET name=?, slug=?, category_id=?, description=?, featured_image=?, address=?, location_area=?, phone=?, email=?, website=?, whatsapp=?, opening_hours=?, verified=?, status=?, updated_at=NOW() WHERE id=?");
                $uStmt->execute([$name, $slug, $category_id, $description, $featured_image, $address, $location_area, $phone, $email, $website, $whatsapp, $opening_hours, $verified, $status, $id]);
                header("Location: /admin/listing_edit.php?id=" . $id . "&updated=1");
                exit;
            } else {
                $newId = 'list_' . time();
                $iStmt = $db->prepare("INSERT INTO zs_listings (id, name, slug, category_id, description, featured_image, address, location_area, phone, email, website, whatsapp, opening_hours, verified, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                $iStmt->execute([$newId, $name, $slug, $category_id, $description, $featured_image, $address, $location_area, $phone, $email, $website, $whatsapp, $opening_hours, $verified, $status]);
                header("Location: /admin/listing_edit.php?id=" . $newId . "&created=1");
                exit;
            }
        } else {
            $error = 'Establishment name and phone number are required.';
        }
    }
}
?>

<div class="zs-content-panel">
    <div class="zs-panel-top">
        <h2><?= $isEdit ? 'Edit Directory Listing' : 'Add Directory Listing' ?></h2>
        <a href="/admin/listings.php" class="zs-btn-reset">&larr; Back to Directory</a>
    </div>

    <?php if ($error): ?><div class="zs-alert-err"><?= sanitize($error) ?></div><?php endif; ?>
    <?php if (isset($_GET['updated']) || isset($_GET['created'])): ?><div class="zs-alert-ok">Listing saved successfully!</div><?php endif; ?>

    <form method="POST" class="zs-form-grid">
        <input type="hidden" name="csrf_token" value="<?= generate_csrf_token() ?>">
        <div class="zs-form-main">
            <div class="zs-form-group">
                <label>Establishment / Business Name *</label>
                <input type="text" name="name" value="<?= sanitize($listing['name']) ?>" class="zs-input" required>
            </div>
            <div class="zs-form-group">
                <label>Slug</label>
                <input type="text" name="slug" value="<?= sanitize($listing['slug']) ?>" class="zs-input">
            </div>
            <div class="zs-form-group">
                <label>Address *</label>
                <input type="text" name="address" value="<?= sanitize($listing['address']) ?>" class="zs-input" required>
            </div>
            <div class="zs-form-group">
                <label>Area / Colony</label>
                <input type="text" name="location_area" value="<?= sanitize($listing['location_area']) ?>" class="zs-input" placeholder="e.g. Project Colony, DC Hill, North Point">
            </div>
            <div class="zs-form-group">
                <label>Description &amp; Services Offered</label>
                <textarea name="description" class="zs-textarea" rows="6"><?= sanitize($listing['description']) ?></textarea>
            </div>
        </div>

        <div class="zs-form-side">
            <div class="zs-side-box">
                <h4>Contact Details</h4>
                <div class="zs-form-group">
                    <label>Category</label>
                    <select name="category_id" class="zs-input">
                        <?php foreach ($cats as $c): ?>
                            <option value="<?= $c['id'] ?>" <?= $listing['category_id'] == $c['id'] ? 'selected' : '' ?>><?= sanitize($c['name']) ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="zs-form-group">
                    <label>Phone Number *</label>
                    <input type="text" name="phone" value="<?= sanitize($listing['phone']) ?>" class="zs-input" required>
                </div>
                <div class="zs-form-group">
                    <label>WhatsApp Number</label>
                    <input type="text" name="whatsapp" value="<?= sanitize($listing['whatsapp']) ?>" class="zs-input">
                </div>
                <div class="zs-form-group">
                    <label>Email Address</label>
                    <input type="email" name="email" value="<?= sanitize($listing['email']) ?>" class="zs-input">
                </div>
                <div class="zs-form-group">
                    <label>Website URL</label>
                    <input type="url" name="website" value="<?= sanitize($listing['website']) ?>" class="zs-input">
                </div>
                <div class="zs-form-group">
                    <label>Opening Hours</label>
                    <input type="text" name="opening_hours" value="<?= sanitize($listing['opening_hours']) ?>" class="zs-input">
                </div>
                <div class="zs-form-group">
                    <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
                        <input type="checkbox" name="verified" value="1" <?= $listing['verified'] ? 'checked' : '' ?>>
                        <strong>Officially Verified Listing</strong>
                    </label>
                </div>
                <div class="zs-form-group">
                    <label>Featured Image URL</label>
                    <input type="text" name="featured_image" value="<?= sanitize($listing['featured_image']) ?>" class="zs-input">
                </div>
                <button type="submit" class="zs-btn-primary" style="width:100%">Save Listing &rarr;</button>
            </div>
        </div>
    </form>
</div>

<?php require_once __DIR__ . '/footer.php'; ?>
`;

  // admin/listing_categories.php (Previously missing!)
  adminFiles['admin/listing_categories.php'] = `<?php
/**
 * Zunheboto Social — Directory Listing Categories CRUD
 */
$pageTitle = 'Directory Categories';
require_once __DIR__ . '/header.php';
$db = get_db_connection();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (verify_csrf_token($_POST['csrf_token'] ?? '')) {
        $action = $_POST['action'] ?? '';
        if ($action === 'add') {
            $name = trim($_POST['name'] ?? '');
            $slug = slugify(trim($_POST['slug'] ?? '') ?: $name);
            $icon = trim($_POST['icon'] ?? 'Building2');
            $desc = trim($_POST['description'] ?? '');

            if ($name && $db) {
                $newId = 'lcat_' . time();
                $stmt = $db->prepare("INSERT INTO zs_listing_categories (id, name, slug, icon, description) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([$newId, $name, $slug, $icon, $desc]);
                header("Location: /admin/listing_categories.php?added=1");
                exit;
            }
        } elseif ($action === 'delete') {
            $delId = trim($_POST['id'] ?? '');
            if ($delId && $db) {
                $stmt = $db->prepare("DELETE FROM zs_listing_categories WHERE id = ?");
                $stmt->execute([$delId]);
                header("Location: /admin/listing_categories.php?deleted=1");
                exit;
            }
        }
    }
}

$categories = $db ? $db->query("SELECT c.*, COUNT(l.id) as listing_count FROM zs_listing_categories c LEFT JOIN zs_listings l ON c.id = l.category_id GROUP BY c.id ORDER BY c.name ASC")->fetchAll() : [];
?>

<div class="zs-dash-grid">
    <div class="zs-content-panel">
        <h3>District Directory Categories</h3>
        <?php if (isset($_GET['added'])): ?><div class="zs-alert-ok">Directory category created!</div><?php endif; ?>
        <?php if (isset($_GET['deleted'])): ?><div class="zs-alert-ok">Directory category deleted!</div><?php endif; ?>
        <table class="zs-table">
            <thead>
                <tr>
                    <th>Icon</th>
                    <th>Category Name</th>
                    <th>Slug</th>
                    <th>Listings</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($categories as $cat): ?>
                <tr>
                    <td><span class="zs-badge-tag"><?= sanitize($cat['icon']) ?></span></td>
                    <td><strong><?= sanitize($cat['name']) ?></strong></td>
                    <td><code><?= sanitize($cat['slug']) ?></code></td>
                    <td><?= (int)$cat['listing_count'] ?></td>
                    <td>
                        <form method="POST" onsubmit="return confirm('Delete this directory category?')" style="display:inline">
                            <input type="hidden" name="action" value="delete">
                            <input type="hidden" name="id" value="<?= $cat['id'] ?>">
                            <input type="hidden" name="csrf_token" value="<?= generate_csrf_token() ?>">
                            <button type="submit" class="zs-btn-sm-del" style="border:none;cursor:pointer">Delete</button>
                        </form>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>

    <div class="zs-content-panel">
        <h3>+ Add Directory Category</h3>
        <form method="POST">
            <input type="hidden" name="action" value="add">
            <input type="hidden" name="csrf_token" value="<?= generate_csrf_token() ?>">
            <div class="zs-form-group">
                <label>Category Name *</label>
                <input type="text" name="name" class="zs-input" placeholder="e.g. Healthcare & Clinics" required>
            </div>
            <div class="zs-form-group">
                <label>Slug</label>
                <input type="text" name="slug" class="zs-input" placeholder="healthcare-clinics">
            </div>
            <div class="zs-form-group">
                <label>Icon Keyword / Emoji</label>
                <input type="text" name="icon" value="Building2" class="zs-input" placeholder="Building2, Hospital, Hotel, ShoppingBag">
            </div>
            <div class="zs-form-group">
                <label>Description</label>
                <textarea name="description" class="zs-textarea" rows="3" placeholder="Description of services in this category..."></textarea>
            </div>
            <button type="submit" class="zs-btn-primary" style="width:100%">Create Directory Category</button>
        </form>
    </div>
</div>

<?php require_once __DIR__ . '/footer.php'; ?>
`;

  // admin/homepage_builder.php
  adminFiles['admin/homepage_builder.php'] = `<?php
/**
 * Zunheboto Social — Homepage Layout & Section Builder
 */
$pageTitle = 'Homepage Builder';
require_once __DIR__ . '/header.php';
$db = get_db_connection();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'save_sections') {
    if (verify_csrf_token($_POST['csrf_token'] ?? '')) {
        if ($db && isset($_POST['sections'])) {
            foreach ($_POST['sections'] as $id => $data) {
                $enabled = isset($data['enabled']) ? 1 : 0;
                $title = trim($data['title'] ?? '');
                $subtitle = trim($data['subtitle'] ?? '');
                $btnText = trim($data['button_text'] ?? '');
                $btnUrl = trim($data['button_url'] ?? '');
                $order = (int)($data['sort_order'] ?? 0);
                $count = (int)($data['item_count'] ?? 4);
                $source = trim($data['content_source'] ?? 'latest');
                $catId = trim($data['category_id'] ?? '');

                $stmt = $db->prepare("UPDATE zs_homepage_sections SET enabled = ?, title = ?, subtitle = ?, button_text = ?, button_url = ?, sort_order = ?, item_count = ?, content_source = ?, category_id = ? WHERE id = ?");
                $stmt->execute([$enabled, $title, $subtitle, $btnText, $btnUrl, $order, $count, $source, $catId, $id]);
            }
            header("Location: /admin/homepage_builder.php?saved=1");
            exit;
        }
    }
}

$sections = $db ? $db->query("SELECT * FROM zs_homepage_sections ORDER BY sort_order ASC")->fetchAll() : [];
$artCats = $db ? $db->query("SELECT * FROM zs_article_categories ORDER BY name ASC")->fetchAll() : [];
?>

<div class="zs-content-panel">
    <div class="zs-panel-top">
        <div>
            <h2>Homepage Layout &amp; Section Builder</h2>
            <p>Customize the order, visibility, titles, item count, and data sources for all district homepage modules.</p>
        </div>
        <button type="submit" form="hpForm" class="zs-btn-primary">Save Homepage Changes &rarr;</button>
    </div>

    <?php if (isset($_GET['saved'])): ?><div class="zs-alert-ok">Homepage configuration saved! All changes are now live on the website.</div><?php endif; ?>

    <form method="POST" id="hpForm">
        <input type="hidden" name="action" value="save_sections">
        <input type="hidden" name="csrf_token" value="<?= generate_csrf_token() ?>">
        <div class="zs-sections-list">
            <?php foreach ($sections as $s): ?>
                <div class="zs-section-edit-card">
                    <div class="zs-sec-head">
                        <label class="zs-sec-enable">
                            <input type="checkbox" name="sections[<?= $s['id'] ?>][enabled]" value="1" <?= $s['enabled'] ? 'checked' : '' ?>>
                            <strong><?= sanitize($s['title']) ?></strong>
                        </label>
                        <span class="zs-badge-tag"><?= sanitize($s['section_type']) ?></span>
                    </div>

                    <div class="zs-sec-body">
                        <div class="zs-form-row">
                            <div class="zs-form-group" style="flex:2">
                                <label>Section Display Title</label>
                                <input type="text" name="sections[<?= $s['id'] ?>][title]" value="<?= sanitize($s['title']) ?>" class="zs-input-sm">
                            </div>
                            <div class="zs-form-group" style="flex:3">
                                <label>Subtitle / Description</label>
                                <input type="text" name="sections[<?= $s['id'] ?>][subtitle]" value="<?= sanitize($s['subtitle']) ?>" class="zs-input-sm">
                            </div>
                            <div class="zs-form-group" style="flex:1;min-width:100px">
                                <label>Sort Order</label>
                                <input type="number" name="sections[<?= $s['id'] ?>][sort_order]" value="<?= (int)$s['sort_order'] ?>" class="zs-input-sm">
                            </div>
                            <div class="zs-form-group" style="flex:1;min-width:100px">
                                <label>Display Count</label>
                                <input type="number" name="sections[<?= $s['id'] ?>][item_count]" value="<?= (int)$s['item_count'] ?>" class="zs-input-sm" min="1" max="16">
                            </div>
                        </div>

                        <div class="zs-form-row" style="margin-top:10px">
                            <div class="zs-form-group" style="flex:1">
                                <label>CTA Button Text</label>
                                <input type="text" name="sections[<?= $s['id'] ?>][button_text]" value="<?= sanitize($s['button_text'] ?? '') ?>" class="zs-input-sm" placeholder="e.g. View All Articles">
                            </div>
                            <div class="zs-form-group" style="flex:1">
                                <label>CTA Button URL</label>
                                <input type="text" name="sections[<?= $s['id'] ?>][button_url]" value="<?= sanitize($s['button_url'] ?? '') ?>" class="zs-input-sm" placeholder="/articles">
                            </div>
                            <?php if (in_array($s['section_type'], ['articles_grid', 'category_strip', 'featured_stories'])): ?>
                            <div class="zs-form-group" style="flex:1">
                                <label>Category Filter</label>
                                <select name="sections[<?= $s['id'] ?>][category_id]" class="zs-input-sm">
                                    <option value="">All Categories</option>
                                    <?php foreach ($artCats as $ac): ?>
                                        <option value="<?= $ac['id'] ?>" <?= ($s['category_id'] ?? '') === $ac['id'] ? 'selected' : '' ?>><?= sanitize($ac['name']) ?></option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </form>
</div>

<?php require_once __DIR__ . '/footer.php'; ?>
`;

  // admin/gallery.php
  adminFiles['admin/gallery.php'] = `<?php
/**
 * Zunheboto Social — Gallery Manager
 */
$pageTitle = 'Photo Gallery Manager';
require_once __DIR__ . '/header.php';
$db = get_db_connection();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (verify_csrf_token($_POST['csrf_token'] ?? '')) {
        $action = $_POST['action'] ?? '';
        if ($action === 'add') {
            $title = trim($_POST['title'] ?? '');
            $image_url = trim($_POST['image_url'] ?? '');
            $caption = trim($_POST['caption'] ?? '');
            $photographer = trim($_POST['photographer'] ?? 'Zunheboto Social Staff');
            $location = trim($_POST['location'] ?? 'Zunheboto Town');

            if ($image_url && $db) {
                $id = 'gal_' . time();
                $stmt = $db->prepare("INSERT INTO zs_gallery (id, title, image_url, caption, photographer, location) VALUES (?, ?, ?, ?, ?, ?)");
                $stmt->execute([$id, $title, $image_url, $caption, $photographer, $location]);
                header("Location: /admin/gallery.php?added=1");
                exit;
            }
        } elseif ($action === 'delete') {
            $delId = trim($_POST['id'] ?? '');
            if ($delId && $db) {
                $stmt = $db->prepare("DELETE FROM zs_gallery WHERE id = ?");
                $stmt->execute([$delId]);
                header("Location: /admin/gallery.php?deleted=1");
                exit;
            }
        }
    }
}

$photos = $db ? $db->query("SELECT * FROM zs_gallery ORDER BY sort_order ASC, created_at DESC")->fetchAll() : [];
?>

<div class="zs-dash-grid">
    <div class="zs-content-panel">
        <h3>Zunheboto District Photo Gallery</h3>
        <?php if (isset($_GET['added'])): ?><div class="zs-alert-ok">Photo added to gallery!</div><?php endif; ?>
        <?php if (isset($_GET['deleted'])): ?><div class="zs-alert-ok">Photo removed!</div><?php endif; ?>
        <div class="zs-gallery-admin-grid">
            <?php foreach ($photos as $p): ?>
                <div class="zs-gal-admin-item">
                    <img src="<?= sanitize($p['image_url']) ?>" alt="">
                    <div class="zs-gal-admin-body">
                        <strong><?= sanitize($p['title']) ?></strong>
                        <p><?= sanitize($p['location']) ?> &bull; <?= sanitize($p['photographer']) ?></p>
                        <form method="POST" onsubmit="return confirm('Delete this photo?')" style="margin-top:8px">
                            <input type="hidden" name="action" value="delete">
                            <input type="hidden" name="id" value="<?= $p['id'] ?>">
                            <input type="hidden" name="csrf_token" value="<?= generate_csrf_token() ?>">
                            <button type="submit" class="zs-btn-sm-del" style="border:none;cursor:pointer">Delete Photo</button>
                        </form>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>

    <div class="zs-content-panel">
        <h3>+ Upload / Add Photo</h3>
        <form method="POST">
            <input type="hidden" name="action" value="add">
            <input type="hidden" name="csrf_token" value="<?= generate_csrf_token() ?>">
            <div class="zs-form-group">
                <label>Photo Title *</label>
                <input type="text" name="title" class="zs-input" placeholder="e.g. Sümi Baptist Church Sunset" required>
            </div>
            <div class="zs-form-group">
                <label>Image URL *</label>
                <input type="text" name="image_url" class="zs-input" placeholder="https://image-url.jpg" required>
            </div>
            <div class="zs-form-group">
                <label>Caption / Story</label>
                <textarea name="caption" class="zs-textarea" rows="2"></textarea>
            </div>
            <div class="zs-form-group">
                <label>Photographer Credit</label>
                <input type="text" name="photographer" value="Staff Photographer" class="zs-input">
            </div>
            <div class="zs-form-group">
                <label>Location</label>
                <input type="text" name="location" value="Zunheboto Town" class="zs-input">
            </div>
            <button type="submit" class="zs-btn-primary" style="width:100%">Add Photo to Gallery</button>
        </form>
    </div>
</div>

<?php require_once __DIR__ . '/footer.php'; ?>
`;

  // admin/media.php
  adminFiles['admin/media.php'] = `<?php
/**
 * Zunheboto Social — Media Library & Uploads
 */
$pageTitle = 'Media Library';
require_once __DIR__ . '/header.php';
$db = get_db_connection();

$mediaItems = $db ? $db->query("SELECT * FROM zs_media ORDER BY created_at DESC")->fetchAll() : [];
?>

<div class="zs-content-panel">
    <div class="zs-panel-top">
        <div>
            <h2>Media Library</h2>
            <p>Upload and manage high-resolution banners, article photos, and district landmarks.</p>
        </div>
        <form action="/admin/upload.php" method="POST" enctype="multipart/form-data" class="zs-upload-form">
            <input type="hidden" name="csrf_token" value="<?= generate_csrf_token() ?>">
            <input type="file" name="media_file" accept="image/jpeg,image/png,image/webp,image/gif" required class="zs-input-sm" id="uploadInput">
            <button type="submit" class="zs-btn-primary">Upload Image</button>
        </form>
    </div>

    <?php if (isset($_GET['uploaded'])): ?><div class="zs-alert-ok">Image uploaded successfully!</div><?php endif; ?>
    <?php if (isset($_GET['error'])): ?><div class="zs-alert-err">Upload failed. Only JPG, PNG, WEBP, and GIF images are permitted.</div><?php endif; ?>

    <div class="zs-media-grid">
        <?php foreach ($mediaItems as $m): ?>
            <div class="zs-media-card">
                <img src="<?= sanitize($m['url']) ?>" alt="<?= sanitize($m['title']) ?>">
                <div class="zs-media-info">
                    <strong><?= sanitize($m['title']) ?></strong>
                    <input type="text" value="<?= sanitize($m['url']) ?>" readonly onclick="this.select();navigator.clipboard.writeText(this.value);alert('Image URL copied to clipboard!');" class="zs-input-sm" style="font-size:11px;margin-top:6px">
                </div>
            </div>
        <?php endforeach; ?>
    </div>
</div>

<?php require_once __DIR__ . '/footer.php'; ?>
`;

  // admin/upload.php
  adminFiles['admin/upload.php'] = `<?php
/**
 * Zunheboto Social — Backend Image Upload Handler
 */
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';
require_admin_auth();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['media_file'])) {
    if (!verify_csrf_token($_POST['csrf_token'] ?? '')) {
        header("Location: /admin/media.php?error=csrf_failed");
        exit;
    }

    $file = $_FILES['media_file'];
    $allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    $allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

    if (in_array($mime, $allowedMimes) && in_array($ext, $allowedExts) && $file['error'] === UPLOAD_ERR_OK) {
        $uploadsDir = __DIR__ . '/../uploads';
        if (!file_exists($uploadsDir)) {
            @mkdir($uploadsDir, 0755, true);
        }
        
        $filename = 'zs_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
        $targetPath = $uploadsDir . '/' . $filename;
        
        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            $url = '/uploads/' . $filename;
            $db = get_db_connection();
            if ($db) {
                $stmt = $db->prepare("INSERT INTO zs_media (id, title, filename, url, file_type, file_size) VALUES (?, ?, ?, ?, ?, ?)");
                $stmt->execute(['med_' . time(), $file['name'], $filename, $url, $mime, $file['size']]);
            }
            header("Location: /admin/media.php?uploaded=1");
            exit;
        }
    }
}
header("Location: /admin/media.php?error=upload_failed");
exit;
`;

  // admin/news_tips.php
  adminFiles['admin/news_tips.php'] = `<?php
/**
 * Zunheboto Social — Citizen News Tips Inbox
 */
$pageTitle = 'Citizen News Tips Inbox';
require_once __DIR__ . '/header.php';
$db = get_db_connection();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (verify_csrf_token($_POST['csrf_token'] ?? '')) {
        $action = $_POST['action'] ?? '';
        $id = $_POST['id'] ?? '';
        if ($action === 'status' && !empty($_POST['status']) && $id) {
            $stmt = $db->prepare("UPDATE zs_news_tips SET status = ? WHERE id = ?");
            $stmt->execute([$_POST['status'], $id]);
        } elseif ($action === 'delete' && $id) {
            $stmt = $db->prepare("DELETE FROM zs_news_tips WHERE id = ?");
            $stmt->execute([$id]);
        }
        header("Location: /admin/news_tips.php");
        exit;
    }
}

$tips = $db ? $db->query("SELECT * FROM zs_news_tips ORDER BY created_at DESC")->fetchAll() : [];
?>

<div class="zs-content-panel">
    <div class="zs-panel-top">
        <div>
            <h2>Citizen News Tips Inbox</h2>
            <p>Review grassroots news reports, emergency alerts, and tips submitted by local citizens.</p>
        </div>
    </div>

    <table class="zs-table">
        <thead>
            <tr>
                <th>Sender</th>
                <th>Contact</th>
                <th>Location</th>
                <th>Report Details</th>
                <th>Status</th>
                <th>Received</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($tips as $t): ?>
            <tr>
                <td><strong><?= sanitize($t['sender_name'] ?: 'Anonymous Tipster') ?></strong></td>
                <td><a href="tel:<?= sanitize($t['sender_contact']) ?>"><?= sanitize($t['sender_contact']) ?></a></td>
                <td><?= sanitize($t['location'] ?: 'Zunheboto') ?></td>
                <td style="max-width:350px"><?= nl2br(sanitize($t['message'])) ?></td>
                <td><span class="zs-badge-status zs-tip-<?= $t['status'] ?>"><?= ucfirst($t['status']) ?></span></td>
                <td><?= date('M j, Y g:ia', strtotime($t['created_at'])) ?></td>
                <td>
                    <div style="display:flex;gap:6px">
                        <?php if ($t['status'] !== 'reviewed'): ?>
                        <form method="POST" style="display:inline">
                            <input type="hidden" name="action" value="status">
                            <input type="hidden" name="status" value="reviewed">
                            <input type="hidden" name="id" value="<?= $t['id'] ?>">
                            <input type="hidden" name="csrf_token" value="<?= generate_csrf_token() ?>">
                            <button type="submit" class="zs-btn-sm-edit" style="border:none;cursor:pointer">Mark Reviewed</button>
                        </form>
                        <?php endif; ?>
                        <form method="POST" onsubmit="return confirm('Delete this tip?')" style="display:inline">
                            <input type="hidden" name="action" value="delete">
                            <input type="hidden" name="id" value="<?= $t['id'] ?>">
                            <input type="hidden" name="csrf_token" value="<?= generate_csrf_token() ?>">
                            <button type="submit" class="zs-btn-sm-del" style="border:none;cursor:pointer">Delete</button>
                        </form>
                    </div>
                </td>
            </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
</div>

<?php require_once __DIR__ . '/footer.php'; ?>
`;

  // admin/hotlines.php
  adminFiles['admin/hotlines.php'] = `<?php
/**
 * Zunheboto Social — Emergency Hotlines Desk
 */
$pageTitle = 'Emergency Hotlines';
require_once __DIR__ . '/header.php';
$db = get_db_connection();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (verify_csrf_token($_POST['csrf_token'] ?? '')) {
        $action = $_POST['action'] ?? '';
        if ($action === 'add') {
            $title = trim($_POST['title'] ?? '');
            $phone = trim($_POST['phone'] ?? '');
            $desc = trim($_POST['description'] ?? '');

            if ($title && $phone && $db) {
                $id = 'hot_' . time();
                $stmt = $db->prepare("INSERT INTO zs_emergency_hotlines (id, title, phone, description) VALUES (?, ?, ?, ?)");
                $stmt->execute([$id, $title, $phone, $desc]);
                header("Location: /admin/hotlines.php?added=1");
                exit;
            }
        } elseif ($action === 'delete') {
            $delId = trim($_POST['id'] ?? '');
            if ($delId && $db) {
                $stmt = $db->prepare("DELETE FROM zs_emergency_hotlines WHERE id = ?");
                $stmt->execute([$delId]);
                header("Location: /admin/hotlines.php?deleted=1");
                exit;
            }
        }
    }
}

$hotlines = $db ? $db->query("SELECT * FROM zs_emergency_hotlines ORDER BY sort_order ASC")->fetchAll() : [];
?>

<div class="zs-dash-grid">
    <div class="zs-content-panel">
        <h3>District Emergency Helpline Numbers</h3>
        <?php if (isset($_GET['added'])): ?><div class="zs-alert-ok">Helpline added!</div><?php endif; ?>
        <?php if (isset($_GET['deleted'])): ?><div class="zs-alert-ok">Helpline deleted!</div><?php endif; ?>
        <table class="zs-table">
            <thead>
                <tr>
                    <th>Service Title</th>
                    <th>Phone Number</th>
                    <th>Description</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($hotlines as $h): ?>
                <tr>
                    <td><strong><?= sanitize($h['title']) ?></strong></td>
                    <td><a href="tel:<?= sanitize($h['phone']) ?>" class="zs-hotline-num"><?= sanitize($h['phone']) ?></a></td>
                    <td><?= sanitize($h['description']) ?></td>
                    <td>
                        <form method="POST" onsubmit="return confirm('Delete helpline?')" style="display:inline">
                            <input type="hidden" name="action" value="delete">
                            <input type="hidden" name="id" value="<?= $h['id'] ?>">
                            <input type="hidden" name="csrf_token" value="<?= generate_csrf_token() ?>">
                            <button type="submit" class="zs-btn-sm-del" style="border:none;cursor:pointer">Delete</button>
                        </form>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>

    <div class="zs-content-panel">
        <h3>+ Add Emergency Hotline</h3>
        <form method="POST">
            <input type="hidden" name="action" value="add">
            <input type="hidden" name="csrf_token" value="<?= generate_csrf_token() ?>">
            <div class="zs-form-group">
                <label>Department / Emergency Service *</label>
                <input type="text" name="title" class="zs-input" placeholder="e.g. Zunheboto Fire & Rescue Station" required>
            </div>
            <div class="zs-form-group">
                <label>Phone / Helpline Number *</label>
                <input type="text" name="phone" class="zs-input" placeholder="+91 3867 220 101" required>
            </div>
            <div class="zs-form-group">
                <label>Details / Coverage</label>
                <textarea name="description" class="zs-textarea" rows="3" placeholder="24/7 emergency response for Zunheboto town and sub-divisions."></textarea>
            </div>
            <button type="submit" class="zs-btn-primary" style="width:100%">Add Helpline</button>
        </form>
    </div>
</div>

<?php require_once __DIR__ . '/footer.php'; ?>
`;

  // admin/pages.php
  adminFiles['admin/pages.php'] = `<?php
/**
 * Zunheboto Social — Static Pages Manager
 */
$pageTitle = 'Static Pages';
require_once __DIR__ . '/header.php';
$db = get_db_connection();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'delete' && !empty($_POST['id'])) {
    if (verify_csrf_token($_POST['csrf_token'] ?? '')) {
        if ($db) {
            $stmt = $db->prepare("DELETE FROM zs_pages WHERE id = ?");
            $stmt->execute([$_POST['id']]);
            header("Location: /admin/pages.php?deleted=1");
            exit;
        }
    }
}

$pages = $db ? $db->query("SELECT * FROM zs_pages ORDER BY title ASC")->fetchAll() : [];
?>

<div class="zs-content-panel">
    <div class="zs-panel-top">
        <div>
            <h2>Static Pages</h2>
            <p>Manage About Us, Contact Desk, Privacy Policy, Terms of Service, and custom landing pages.</p>
        </div>
        <a href="/admin/page_edit.php" class="zs-btn-primary">+ Create New Page</a>
    </div>

    <?php if (isset($_GET['deleted'])): ?><div class="zs-alert-ok">Page deleted!</div><?php endif; ?>

    <table class="zs-table">
        <thead>
            <tr>
                <th>Page Title</th>
                <th>Slug / URL</th>
                <th>Status</th>
                <th>Updated</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($pages as $p): ?>
            <tr>
                <td><strong><a href="/admin/page_edit.php?id=<?= $p['id'] ?>"><?= sanitize($p['title']) ?></a></strong></td>
                <td><code>/<?= sanitize($p['slug']) ?></code></td>
                <td><span class="zs-badge-status zs-status-<?= $p['status'] ?>"><?= ucfirst($p['status']) ?></span></td>
                <td><?= date('M j, Y', strtotime($p['updated_at'])) ?></td>
                <td>
                    <div style="display:flex;gap:6px;align-items:center">
                        <a href="/admin/page_edit.php?id=<?= $p['id'] ?>" class="zs-btn-sm-edit">Edit</a>
                        <a href="/<?= sanitize($p['slug']) ?>" target="_blank" class="zs-btn-sm-view">View</a>
                        <form method="POST" onsubmit="return confirm('Delete this static page?')" style="display:inline">
                            <input type="hidden" name="action" value="delete">
                            <input type="hidden" name="id" value="<?= $p['id'] ?>">
                            <input type="hidden" name="csrf_token" value="<?= generate_csrf_token() ?>">
                            <button type="submit" class="zs-btn-sm-del" style="border:none;cursor:pointer">Delete</button>
                        </form>
                    </div>
                </td>
            </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
</div>

<?php require_once __DIR__ . '/footer.php'; ?>
`;

  // admin/page_edit.php
  adminFiles['admin/page_edit.php'] = `<?php
/**
 * Zunheboto Social — Static Page Editor
 */
$id = $_GET['id'] ?? '';
$isEdit = !empty($id);
$pageTitle = $isEdit ? 'Edit Page' : 'Create Page';
require_once __DIR__ . '/header.php';
$db = get_db_connection();

$page = [
    'title' => '',
    'slug' => '',
    'content' => '',
    'featured_image' => '',
    'status' => 'published',
    'seo_title' => '',
    'meta_description' => ''
];

if ($isEdit && $db) {
    $stmt = $db->prepare("SELECT * FROM zs_pages WHERE id = ?");
    $stmt->execute([$id]);
    $found = $stmt->fetch();
    if ($found) $page = $found;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (verify_csrf_token($_POST['csrf_token'] ?? '')) {
        $title = trim($_POST['title'] ?? '');
        $slug = slugify(trim($_POST['slug'] ?? '') ?: $title);
        $content = trim($_POST['content'] ?? '');
        $status = trim($_POST['status'] ?? 'published');
        $seo_title = trim($_POST['seo_title'] ?? '') ?: $title;
        $meta_description = trim($_POST['meta_description'] ?? '');

        if ($title && $content && $db) {
            if ($isEdit) {
                $uStmt = $db->prepare("UPDATE zs_pages SET title=?, slug=?, content=?, status=?, seo_title=?, meta_description=?, updated_at=NOW() WHERE id=?");
                $uStmt->execute([$title, $slug, $content, $status, $seo_title, $meta_description, $id]);
                header("Location: /admin/page_edit.php?id=" . $id . "&updated=1");
                exit;
            } else {
                $newId = 'page_' . time();
                $iStmt = $db->prepare("INSERT INTO zs_pages (id, title, slug, content, status, seo_title, meta_description) VALUES (?, ?, ?, ?, ?, ?, ?)");
                $iStmt->execute([$newId, $title, $slug, $content, $status, $seo_title, $meta_description]);
                header("Location: /admin/page_edit.php?id=" . $newId . "&created=1");
                exit;
            }
        }
    }
}
?>

<div class="zs-content-panel">
    <div class="zs-panel-top">
        <h2><?= $isEdit ? 'Edit Static Page' : 'Create Static Page' ?></h2>
        <a href="/admin/pages.php" class="zs-btn-reset">&larr; Back to Pages</a>
    </div>

    <?php if (isset($_GET['updated']) || isset($_GET['created'])): ?><div class="zs-alert-ok">Page saved successfully!</div><?php endif; ?>

    <form method="POST">
        <input type="hidden" name="csrf_token" value="<?= generate_csrf_token() ?>">
        <div class="zs-form-group">
            <label>Page Title *</label>
            <input type="text" name="title" value="<?= sanitize($page['title']) ?>" class="zs-input" required>
        </div>
        <div class="zs-form-group">
            <label>Slug / Route Permalink</label>
            <input type="text" name="slug" value="<?= sanitize($page['slug']) ?>" class="zs-input" placeholder="e.g. about, contact, privacy-policy">
        </div>
        <div class="zs-form-group">
            <label>Page Content *</label>
            <textarea name="content" class="zs-textarea" rows="14" required><?= sanitize($page['content']) ?></textarea>
        </div>
        <div class="zs-form-group">
            <label>SEO Meta Title</label>
            <input type="text" name="seo_title" value="<?= sanitize($page['seo_title'] ?? '') ?>" class="zs-input">
        </div>
        <div class="zs-form-group">
            <label>SEO Meta Description</label>
            <textarea name="meta_description" class="zs-textarea" rows="2"><?= sanitize($page['meta_description'] ?? '') ?></textarea>
        </div>
        <button type="submit" class="zs-btn-primary">Save Page &rarr;</button>
    </form>
</div>

<?php require_once __DIR__ . '/footer.php'; ?>
`;

  // admin/menus.php
  adminFiles['admin/menus.php'] = `<?php
/**
 * Zunheboto Social — Navigation Menus Manager
 */
$pageTitle = 'Navigation Menus';
require_once __DIR__ . '/header.php';
$db = get_db_connection();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (verify_csrf_token($_POST['csrf_token'] ?? '')) {
        $action = $_POST['action'] ?? '';
        if ($action === 'add') {
            $label = trim($_POST['label'] ?? '');
            $url = trim($_POST['url'] ?? '');
            $group = trim($_POST['menu_group'] ?? 'main');
            $sort = (int)($_POST['sort_order'] ?? 0);
            $target = trim($_POST['target'] ?? '_self');

            if ($label && $url && $db) {
                $id = 'menu_' . time();
                $stmt = $db->prepare("INSERT INTO zs_menus (id, menu_group, label, url, sort_order, target) VALUES (?, ?, ?, ?, ?, ?)");
                $stmt->execute([$id, $group, $label, $url, $sort, $target]);
                header("Location: /admin/menus.php?added=1");
                exit;
            }
        } elseif ($action === 'delete') {
            $delId = trim($_POST['id'] ?? '');
            if ($delId && $db) {
                $stmt = $db->prepare("DELETE FROM zs_menus WHERE id = ?");
                $stmt->execute([$delId]);
                header("Location: /admin/menus.php?deleted=1");
                exit;
            }
        }
    }
}

$menus = $db ? $db->query("SELECT * FROM zs_menus ORDER BY menu_group ASC, sort_order ASC")->fetchAll() : [];
?>

<div class="zs-dash-grid">
    <div class="zs-content-panel">
        <h3>Active Navigation Menu Links</h3>
        <p style="font-size:13px;color:#64748b;margin-bottom:16px">These links are dynamically rendered in the public header and footer navigation bars.</p>
        <?php if (isset($_GET['added'])): ?><div class="zs-alert-ok">Menu item added!</div><?php endif; ?>
        <?php if (isset($_GET['deleted'])): ?><div class="zs-alert-ok">Menu item deleted!</div><?php endif; ?>

        <table class="zs-table">
            <thead>
                <tr>
                    <th>Location</th>
                    <th>Label</th>
                    <th>URL Link</th>
                    <th>Order</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($menus as $m): ?>
                <tr>
                    <td><span class="zs-badge-tag"><?= sanitize($m['menu_group'] === 'main' ? 'Header Menu' : 'Footer Menu') ?></span></td>
                    <td><strong><?= sanitize($m['label']) ?></strong></td>
                    <td><code><?= sanitize($m['url']) ?></code></td>
                    <td><?= (int)$m['sort_order'] ?></td>
                    <td>
                        <form method="POST" onsubmit="return confirm('Delete link?')" style="display:inline">
                            <input type="hidden" name="action" value="delete">
                            <input type="hidden" name="id" value="<?= $m['id'] ?>">
                            <input type="hidden" name="csrf_token" value="<?= generate_csrf_token() ?>">
                            <button type="submit" class="zs-btn-sm-del" style="border:none;cursor:pointer">Delete</button>
                        </form>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>

    <div class="zs-content-panel">
        <h3>+ Add Navigation Link</h3>
        <form method="POST">
            <input type="hidden" name="action" value="add">
            <input type="hidden" name="csrf_token" value="<?= generate_csrf_token() ?>">
            <div class="zs-form-group">
                <label>Menu Location</label>
                <select name="menu_group" class="zs-input">
                    <option value="main">Header Main Navigation</option>
                    <option value="footer">Footer Navigation</option>
                </select>
            </div>
            <div class="zs-form-group">
                <label>Link Label *</label>
                <input type="text" name="label" class="zs-input" placeholder="e.g. District Map" required>
            </div>
            <div class="zs-form-group">
                <label>Destination URL *</label>
                <input type="text" name="url" class="zs-input" placeholder="/directory or https://..." required>
            </div>
            <div class="zs-form-group">
                <label>Sort Order</label>
                <input type="number" name="sort_order" value="0" class="zs-input">
            </div>
            <div class="zs-form-group">
                <label>Target</label>
                <select name="target" class="zs-input">
                    <option value="_self">Same Window (_self)</option>
                    <option value="_blank">New Tab (_blank)</option>
                </select>
            </div>
            <button type="submit" class="zs-btn-primary" style="width:100%">Add Menu Link</button>
        </form>
    </div>
</div>

<?php require_once __DIR__ . '/footer.php'; ?>
`;

  // admin/settings.php
  adminFiles['admin/settings.php'] = `<?php
/**
 * Zunheboto Social — Site Settings & Branding
 */
$pageTitle = 'Site Settings & Branding';
require_once __DIR__ . '/header.php';
$db = get_db_connection();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (verify_csrf_token($_POST['csrf_token'] ?? '')) {
        if ($db) {
            $settingsToSave = [
                'site_name' => trim($_POST['site_name'] ?? 'Zunheboto Social'),
                'site_title' => trim($_POST['site_title'] ?? ''),
                'tagline' => trim($_POST['tagline'] ?? ''),
                'site_url' => rtrim(trim($_POST['site_url'] ?? ''), '/'),
                'contact_email' => trim($_POST['contact_email'] ?? ''),
                'contact_phone' => trim($_POST['contact_phone'] ?? ''),
                'contact_address' => trim($_POST['contact_address'] ?? ''),
                'logo_url' => trim($_POST['logo_url'] ?? ''),
                'logo_height_desktop' => (int)($_POST['logo_height_desktop'] ?? 60),
                'logo_height_mobile' => (int)($_POST['logo_height_mobile'] ?? 44),
                'og_image' => trim($_POST['og_image'] ?? ''),
                'site_icon_url' => trim($_POST['site_icon_url'] ?? ''),
                'social_facebook' => trim($_POST['social_facebook'] ?? ''),
                'social_twitter' => trim($_POST['social_twitter'] ?? ''),
                'social_instagram' => trim($_POST['social_instagram'] ?? ''),
                'social_youtube' => trim($_POST['social_youtube'] ?? ''),
                'social_whatsapp' => trim($_POST['social_whatsapp'] ?? ''),
                'default_meta_description' => trim($_POST['default_meta_description'] ?? ''),
                'default_meta_keywords' => trim($_POST['default_meta_keywords'] ?? ''),
                'copyright_text' => trim($_POST['copyright_text'] ?? ''),
                'footer_branding_text' => trim($_POST['footer_branding_text'] ?? ''),
                'footer_show_zip_download' => isset($_POST['footer_show_zip_download']) ? '1' : '0'
            ];

            foreach ($settingsToSave as $k => $v) {
                set_setting($k, $v);
            }
            header("Location: /admin/settings.php?saved=1");
            exit;
        }
    }
}

$siteName = get_setting('site_name', 'Zunheboto Social');
$siteTitle = get_setting('site_title', 'Zunheboto Social — District News & Directory');
$tagline = get_setting('tagline', 'The heartbeat of Zunheboto town and district');
$siteUrl = get_setting('site_url', 'https://zunheboto.social');
$contactEmail = get_setting('contact_email', 'admin@zunheboto.social');
$contactPhone = get_setting('contact_phone', '+91 3867 220 000');
$contactAddress = get_setting('contact_address', 'DC Hill Road, Zunheboto Town, Nagaland — 798620');
$logoUrl = get_setting('logo_url', '');
$logoHeightDesktop = get_setting('logo_height_desktop', get_setting('logo_height', '60'));
$logoHeightMobile = get_setting('logo_height_mobile', '44');
$ogImage = get_setting('og_image', get_setting('social_image_url', ''));
$siteIconUrl = get_setting('site_icon_url', '');
$socialFb = get_setting('social_facebook', '');
$socialTw = get_setting('social_twitter', '');
$socialIg = get_setting('social_instagram', '');
$socialYt = get_setting('social_youtube', '');
$socialWa = get_setting('social_whatsapp', '');
$metaDesc = get_setting('default_meta_description', 'Official independent news and business directory for Zunheboto District, Nagaland.');
$metaKeys = get_setting('default_meta_keywords', 'Zunheboto, Nagaland, Sumi, district news, directory, local business');
$copyrightText = get_setting('copyright_text', '© ' . date('Y') . ' Zunheboto Social. All rights reserved.');
$footerText = get_setting('footer_branding_text', 'Zunheboto Social is the dedicated local news portal and civic directory for Zunheboto district, Nagaland.');
$showZip = get_setting('footer_show_zip_download', '1') === '1';
?>

<div class="zs-content-panel">
    <div class="zs-panel-top">
        <div>
            <h2>Site Settings &amp; District Branding</h2>
            <p>Configure portal identity, logos, contact channels, SEO tags, copyright, and deployment options.</p>
        </div>
        <button type="submit" form="settingsForm" class="zs-btn-primary">Save Settings &rarr;</button>
    </div>

    <?php if (isset($_GET['saved'])): ?><div class="zs-alert-ok">Settings saved successfully!</div><?php endif; ?>

    <form method="POST" id="settingsForm" class="zs-form-grid">
        <input type="hidden" name="csrf_token" value="<?= generate_csrf_token() ?>">
        <div class="zs-form-main">
            <h3>Site Identity</h3>
            <div class="zs-form-group">
                <label>Website Name *</label>
                <input type="text" name="site_name" value="<?= sanitize($siteName) ?>" class="zs-input" required>
            </div>
            <div class="zs-form-group">
                <label>Default Page &amp; SEO Title</label>
                <input type="text" name="site_title" value="<?= sanitize($siteTitle) ?>" class="zs-input">
            </div>
            <div class="zs-form-group">
                <label>Header Tagline / Slogan</label>
                <input type="text" name="tagline" value="<?= sanitize($tagline) ?>" class="zs-input">
            </div>
            <div class="zs-form-group">
                <label>Production Site URL</label>
                <input type="url" name="site_url" value="<?= sanitize($siteUrl) ?>" class="zs-input" placeholder="https://zunheboto.social">
            </div>
            <div class="zs-form-group">
                <label>Logo Image URL (Optional - leave blank to display text logo)</label>
                <input type="text" name="logo_url" value="<?= sanitize($logoUrl) ?>" class="zs-input" placeholder="https://...">
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                <div class="zs-form-group">
                    <label>Logo Height Desktop (px)</label>
                    <input type="number" name="logo_height_desktop" value="<?= (int)$logoHeightDesktop ?>" class="zs-input" min="20" max="150">
                </div>
                <div class="zs-form-group">
                    <label>Logo Height Mobile (px)</label>
                    <input type="number" name="logo_height_mobile" value="<?= (int)$logoHeightMobile ?>" class="zs-input" min="20" max="100">
                </div>
            </div>
            <div class="zs-form-group">
                <label>Default Social / Open Graph Image URL</label>
                <input type="text" name="og_image" value="<?= sanitize($ogImage) ?>" class="zs-input" placeholder="https://...">
            </div>
            <div class="zs-form-group">
                <label>Site Favicon URL</label>
                <input type="text" name="site_icon_url" value="<?= sanitize($siteIconUrl) ?>" class="zs-input" placeholder="https://...">
            </div>

            <h3 style="margin-top:28px">Search Engine Optimization (SEO)</h3>
            <div class="zs-form-group">
                <label>Default Meta Description</label>
                <textarea name="default_meta_description" class="zs-textarea" rows="2"><?= sanitize($metaDesc) ?></textarea>
            </div>
            <div class="zs-form-group">
                <label>Default Meta Keywords</label>
                <input type="text" name="default_meta_keywords" value="<?= sanitize($metaKeys) ?>" class="zs-input">
            </div>

            <h3 style="margin-top:28px">Footer &amp; Copyright</h3>
            <div class="zs-form-group">
                <label>Footer Mission &amp; Branding Summary</label>
                <textarea name="footer_branding_text" class="zs-textarea" rows="3"><?= sanitize($footerText) ?></textarea>
            </div>
            <div class="zs-form-group">
                <label>Footer Copyright Statement</label>
                <input type="text" name="copyright_text" value="<?= sanitize($copyrightText) ?>" class="zs-input">
            </div>
        </div>

        <div class="zs-form-side">
            <div class="zs-side-box">
                <h4>Contact Desk</h4>
                <div class="zs-form-group">
                    <label>Public Contact Email</label>
                    <input type="email" name="contact_email" value="<?= sanitize($contactEmail) ?>" class="zs-input">
                </div>
                <div class="zs-form-group">
                    <label>District Editorial Phone</label>
                    <input type="text" name="contact_phone" value="<?= sanitize($contactPhone) ?>" class="zs-input">
                </div>
                <div class="zs-form-group">
                    <label>Physical Office Address</label>
                    <input type="text" name="contact_address" value="<?= sanitize($contactAddress) ?>" class="zs-input">
                </div>
            </div>

            <div class="zs-side-box" style="margin-top:20px">
                <h4>Social Media Channels</h4>
                <div class="zs-form-group">
                    <label>Facebook Page</label>
                    <input type="url" name="social_facebook" value="<?= sanitize($socialFb) ?>" class="zs-input" placeholder="https://facebook.com/...">
                </div>
                <div class="zs-form-group">
                    <label>Twitter / X Profile</label>
                    <input type="url" name="social_twitter" value="<?= sanitize($socialTw) ?>" class="zs-input" placeholder="https://twitter.com/...">
                </div>
                <div class="zs-form-group">
                    <label>Instagram</label>
                    <input type="url" name="social_instagram" value="<?= sanitize($socialIg) ?>" class="zs-input" placeholder="https://instagram.com/...">
                </div>
                <div class="zs-form-group">
                    <label>YouTube Channel</label>
                    <input type="url" name="social_youtube" value="<?= sanitize($socialYt) ?>" class="zs-input" placeholder="https://youtube.com/...">
                </div>
                <div class="zs-form-group">
                    <label>WhatsApp Helpline</label>
                    <input type="text" name="social_whatsapp" value="<?= sanitize($socialWa) ?>" class="zs-input" placeholder="+91...">
                </div>
            </div>

            <div class="zs-side-box" style="margin-top:20px;border-left:4px solid #d97706">
                <h4>Homepage ZIP Download Option</h4>
                <p style="font-size:12px;color:#64748b;margin-bottom:12px">
                    Controls whether the deployable ZIP package download banner is displayed below the copyright bar on the public website.
                </p>
                <label style="display:flex;align-items:center;gap:10px;cursor:pointer">
                    <input type="checkbox" name="footer_show_zip_download" value="1" <?= $showZip ? 'checked' : '' ?>>
                    <strong>Show ZIP Download on Homepage</strong>
                </label>
            </div>
        </div>
    </form>
</div>

<?php require_once __DIR__ . '/footer.php'; ?>
`;

  // admin/profile.php
  adminFiles['admin/profile.php'] = `<?php
/**
 * Zunheboto Social — Administrator Profile & Credentials
 */
$pageTitle = 'Administrator Profile';
require_once __DIR__ . '/header.php';
$db = get_db_connection();

$adminId = $_SESSION['zs_admin_id'] ?? 1;
$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verify_csrf_token($_POST['csrf_token'] ?? '')) {
        $error = 'Security check failed. Please refresh and try again.';
    } else {
        $name = trim($_POST['name'] ?? '');
        $email = trim($_POST['email'] ?? '');
        $newPass = trim($_POST['new_password'] ?? '');

        if ($name && $email && $db) {
            if (!empty($newPass)) {
                $hash = password_hash($newPass, PASSWORD_BCRYPT);
                $stmt = $db->prepare("UPDATE zs_users SET name = ?, email = ?, password_hash = ? WHERE id = ?");
                $stmt->execute([$name, $email, $hash, $adminId]);
            } else {
                $stmt = $db->prepare("UPDATE zs_users SET name = ?, email = ? WHERE id = ?");
                $stmt->execute([$name, $email, $adminId]);
            }
            $_SESSION['zs_admin_name'] = $name;
            $_SESSION['zs_admin_email'] = $email;
            $success = 'Profile & security credentials updated!';
        } else {
            $error = 'Name and email address are required.';
        }
    }
}

$user = $db ? $db->query("SELECT * FROM zs_users WHERE id = " . (int)$adminId)->fetch() : [];
?>

<div class="zs-content-panel" style="max-width:600px">
    <h2>Administrator Profile &amp; Password</h2>
    <p>Manage your login credentials, name, and administrative security.</p>

    <?php if ($error): ?><div class="zs-alert-err"><?= sanitize($error) ?></div><?php endif; ?>
    <?php if ($success): ?><div class="zs-alert-ok"><?= sanitize($success) ?></div><?php endif; ?>

    <form method="POST" style="margin-top:20px">
        <input type="hidden" name="csrf_token" value="<?= generate_csrf_token() ?>">
        <div class="zs-form-group">
            <label>Administrator Full Name *</label>
            <input type="text" name="name" value="<?= sanitize($user['name'] ?? 'Administrator') ?>" class="zs-input" required>
        </div>
        <div class="zs-form-group">
            <label>Username</label>
            <input type="text" value="<?= sanitize($user['username'] ?? 'administrator') ?>" class="zs-input" disabled style="background:#f1f5f9">
        </div>
        <div class="zs-form-group">
            <label>Admin Email Address *</label>
            <input type="email" name="email" value="<?= sanitize($user['email'] ?? 'admin@zunheboto.social') ?>" class="zs-input" required>
        </div>
        <div class="zs-form-group">
            <label>Change Password (Leave blank to keep current)</label>
            <input type="password" name="new_password" class="zs-input" placeholder="New secure password">
        </div>
        <button type="submit" class="zs-btn-primary">Update Profile &rarr;</button>
    </form>
</div>

<?php require_once __DIR__ . '/footer.php'; ?>
`;

  // admin/backup.php
  adminFiles['admin/backup.php'] = `<?php
/**
 * Zunheboto Social — Database Backup & Export Utility
 */
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/db.php';
start_secure_session();

if (!is_admin_logged_in()) {
    header('Location: /admin/login.php');
    exit;
}

$db = get_db_connection();
$tables = [
    'zs_settings',
    'zs_articles',
    'zs_article_categories',
    'zs_listings',
    'zs_listing_categories',
    'zs_pages',
    'zs_homepage_sections',
    'zs_emergency_hotlines',
    'zs_gallery',
    'zs_media',
    'zs_menu_items',
    'zs_news_tips',
    'zs_users'
];

// Handle SQL Backup Download
if (isset($_GET['action']) && $_GET['action'] === 'export_sql') {
    if (!$db) {
        die('Database connection not established.');
    }
    $filename = 'zunheboto_social_backup_' . date('Y-m-d_His') . '.sql';
    header('Content-Type: text/plain; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $filename . '"');

    echo "-- ==========================================================\\n";
    echo "-- Zunheboto Social CMS — Full Database Export\\n";
    echo "-- Generated: " . date('Y-m-d H:i:s T') . "\\n";
    echo "-- Host: " . ($_SERVER['HTTP_HOST'] ?? 'localhost') . "\\n";
    echo "-- ==========================================================\\n\\n";
    echo "SET FOREIGN_KEY_CHECKS = 0;\\n\\n";

    foreach ($tables as $tbl) {
        try {
            $createStmt = $db->query("SHOW CREATE TABLE \`$tbl\`");
            if ($createRow = $createStmt->fetch(PDO::FETCH_NUM)) {
                echo "-- Table structure for \`$tbl\`\\n";
                echo "DROP TABLE IF EXISTS \`$tbl\`;\\n";
                echo $createRow[1] . ";\\n\\n";

                $rowsStmt = $db->query("SELECT * FROM \`$tbl\`");
                $rows = $rowsStmt->fetchAll(PDO::FETCH_ASSOC);
                if (!empty($rows)) {
                    echo "-- Dumping data for \`$tbl\`\\n";
                    foreach ($rows as $row) {
                        $cols = array_map(function($c) { return "\`" . str_replace('\`', '\`\`', $c) . "\`"; }, array_keys($row));
                        $vals = array_map(function($v) use ($db) {
                            if ($v === null) return 'NULL';
                            return $db->quote($v);
                        }, array_values($row));
                        echo "INSERT INTO \`$tbl\` (" . implode(', ', $cols) . ") VALUES (" . implode(', ', $vals) . ");\\n";
                    }
                    echo "\\n";
                }
            }
        } catch (Exception $e) {
            echo "-- Error dumping $tbl: " . $e->getMessage() . "\\n\\n";
        }
    }

    echo "SET FOREIGN_KEY_CHECKS = 1;\\n";
    echo "-- End of backup file\\n";
    exit;
}

// Handle JSON Backup Download
if (isset($_GET['action']) && $_GET['action'] === 'export_json') {
    if (!$db) {
        die('Database connection not established.');
    }
    $filename = 'zunheboto_social_export_' . date('Y-m-d_His') . '.json';
    header('Content-Type: application/json; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $filename . '"');

    $exportData = [
        'metadata' => [
            'site' => get_setting('site_name', 'Zunheboto Social'),
            'exported_at' => date('c'),
            'generator' => 'Zunheboto Social CMS Backup Utility'
        ],
        'tables' => []
    ];

    foreach ($tables as $tbl) {
        try {
            $rows = $db->query("SELECT * FROM \`$tbl\`")->fetchAll(PDO::FETCH_ASSOC);
            $exportData['tables'][$tbl] = $rows;
        } catch (Exception $e) {
            $exportData['tables'][$tbl] = [];
        }
    }

    echo json_encode($exportData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

$pageTitle = 'Database Backup & Export';
$currentPage = 'backup';
require_once __DIR__ . '/header.php';

// Gather table stats
$stats = [];
if ($db) {
    foreach ($tables as $tbl) {
        try {
            $cnt = $db->query("SELECT COUNT(*) FROM \`$tbl\`")->fetchColumn();
            $stats[$tbl] = (int)$cnt;
        } catch (Exception $e) {
            $stats[$tbl] = 'Error: ' . $e->getMessage();
        }
    }
}
?>

<div class="zs-admin-page-header">
    <div>
        <h2>💾 Database Backup &amp; Data Export</h2>
        <p class="zs-text-muted">Export complete, self-contained SQL dumps or JSON snapshots of your entire Zunheboto Social database.</p>
    </div>
    <div style="display:flex;gap:10px">
        <a href="/admin/backup.php?action=export_sql" class="zs-btn-primary">
            <span>⬇️ Download Full SQL Backup (.sql)</span>
        </a>
        <a href="/admin/backup.php?action=export_json" class="zs-btn-secondary">
            <span>📦 Export Raw JSON (.json)</span>
        </a>
    </div>
</div>

<div class="zs-dashboard-row" style="display:grid;grid-template-columns:2fr 1fr;gap:24px;margin-top:20px">
    <div class="zs-card">
        <div class="zs-card-header">
            <h3>Database Tables Overview</h3>
        </div>
        <table class="zs-table">
            <thead>
                <tr>
                    <th>Table Name</th>
                    <th>Purpose / Category</th>
                    <th style="text-align:right">Total Records</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($tables as $tbl): ?>
                    <tr>
                        <td><code><?= sanitize($tbl) ?></code></td>
                        <td>
                            <?php
                            $labels = [
                                'zs_settings' => 'System & Branding Settings',
                                'zs_articles' => 'Journalistic News Articles',
                                'zs_article_categories' => 'Article Classifications',
                                'zs_listings' => 'Directory Profiles & Coordinates',
                                'zs_listing_categories' => 'Directory Taxonomies',
                                'zs_pages' => 'Custom Static CMS Pages',
                                'zs_homepage_sections' => 'Layout Builder Rows',
                                'zs_emergency_hotlines' => 'Civic Hotline Database',
                                'zs_gallery' => 'Photo Archives',
                                'zs_media' => 'Uploaded Assets Registry',
                                'zs_menu_items' => 'Header & Footer Navigation',
                                'zs_news_tips' => 'Citizen Submissions',
                                'zs_users' => 'Admin & Author Credentials'
                            ];
                            echo $labels[$tbl] ?? 'System Table';
                            ?>
                        </td>
                        <td style="text-align:right;font-weight:700">
                            <?= is_int($stats[$tbl]) ? number_format($stats[$tbl]) : sanitize($stats[$tbl]) ?>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>

    <div>
        <div class="zs-card">
            <div class="zs-card-header">
                <h3>System Information</h3>
            </div>
            <div style="padding:16px;font-size:13px;line-height:1.8">
                <div><strong>PHP Version:</strong> <code><?= phpversion() ?></code></div>
                <div><strong>Server API:</strong> <code><?= php_sapi_name() ?></code></div>
                <div><strong>Database PDO Driver:</strong> <code><?= $db ? $db->getAttribute(PDO::ATTR_DRIVER_NAME) : 'Not Connected' ?></code></div>
                <div><strong>Server Time:</strong> <?= date('Y-m-d H:i:s T') ?></div>
                <div style="margin-top:14px;padding-top:14px;border-top:1px solid #e2e8f0">
                    <span style="display:inline-block;padding:3px 8px;background:#dcfce7;color:#166534;border-radius:4px;font-size:11px;font-weight:700">
                        SAFE DISASTER RECOVERY
                    </span>
                    <p style="margin:8px 0 0;color:#64748b;font-size:12px">
                        Backups generated here are 100% compatible with MySQL 5.7+, MySQL 8.0+, MariaDB, and phpMyAdmin import utilities.
                    </p>
                </div>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/footer.php'; ?>
`;

  // admin/css/admin.css
  adminFiles['admin/css/admin.css'] = `
:root {
  --navy: #0b192c;
  --navy-dark: #060f1b;
  --amber: #d97706;
  --amber-light: #fef3c7;
  --bg: #f8fafc;
  --card-bg: #ffffff;
  --border: #e2e8f0;
  --text: #0f172a;
  --text-muted: #64748b;
  --primary: #0284c7;
}

* { box-sizing: border-box; }
body.zs-admin-body {
  margin: 0;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--bg);
  color: var(--text);
  font-size: 14px;
}

.zs-admin-wrapper {
  display: flex;
  min-height: 100vh;
}

/* Sidebar */
.zs-admin-sidebar {
  width: 260px;
  background: var(--navy);
  color: #fff;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  border-right: 1px solid #1e293b;
}

.zs-sidebar-brand {
  padding: 20px;
  border-bottom: 1px solid #1e293b;
}

.zs-sidebar-brand a {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #fff;
  text-decoration: none;
}

.zs-brand-icon {
  font-size: 24px;
  background: var(--amber);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.zs-brand-info strong {
  display: block;
  font-size: 15px;
  font-weight: 700;
}

.zs-version-badge {
  font-size: 10px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.zs-admin-nav {
  padding: 16px 12px;
  flex: 1;
  overflow-y: auto;
}

.zs-nav-group {
  margin-bottom: 20px;
}

.zs-nav-label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 0 10px 6px 10px;
}

.zs-nav-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  color: #cbd5e1;
  text-decoration: none;
  font-weight: 500;
  border-radius: 6px;
  transition: all 0.15s;
  margin-bottom: 2px;
}

.zs-nav-link:hover {
  background: #1e293b;
  color: #fff;
}

.zs-nav-link.active {
  background: var(--amber);
  color: #0b192c;
  font-weight: 700;
}

.zs-sidebar-footer {
  padding: 16px 12px;
  border-top: 1px solid #1e293b;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.zs-btn-view-site {
  display: block;
  padding: 8px;
  background: #1e293b;
  color: #cbd5e1;
  text-align: center;
  border-radius: 6px;
  text-decoration: none;
  font-size: 12px;
  font-weight: 600;
}

.zs-btn-logout {
  display: block;
  padding: 8px;
  background: transparent;
  color: #ef4444;
  text-align: center;
  border-radius: 6px;
  text-decoration: none;
  font-size: 12px;
  font-weight: 600;
}

/* Main Area */
.zs-admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.zs-admin-topbar {
  background: #fff;
  border-bottom: 1px solid var(--border);
  padding: 14px 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.zs-topbar-breadcrumb {
  font-size: 13px;
  color: var(--text-muted);
}

.zs-bc-sep { margin: 0 6px; }
.zs-bc-current { color: var(--text); font-weight: 600; }

.zs-admin-body-inner {
  padding: 28px;
  flex: 1;
}

.zs-admin-footer {
  background: #fff;
  border-top: 1px solid var(--border);
  padding: 14px 28px;
  font-size: 12px;
  color: var(--text-muted);
  display: flex;
  justify-content: space-between;
}

/* Content Panels */
.zs-content-panel {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.zs-panel-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.zs-panel-top h2 { margin: 0 0 4px 0; font-size: 20px; }
.zs-panel-top p { margin: 0; color: var(--text-muted); font-size: 13px; }

/* Dashboard Cards */
.zs-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.zs-stat-card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.zs-stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.zs-stat-number { display: block; font-size: 24px; font-weight: 800; color: var(--navy); }
.zs-stat-label { font-size: 12px; color: var(--text-muted); font-weight: 600; }

.zs-quick-actions {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 24px;
}

.zs-quick-actions h3 { margin: 0 0 12px 0; font-size: 15px; }
.zs-action-btns { display: flex; gap: 10px; flex-wrap: wrap; }

.zs-btn-action {
  padding: 8px 14px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--navy);
  text-decoration: none;
  transition: all 0.15s;
}

.zs-btn-action:hover { background: #e2e8f0; }

.zs-btn-primary {
  background: var(--navy);
  color: #fff;
  border: none;
  padding: 10px 18px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
}

.zs-btn-primary:hover { background: #1e293b; }

.zs-btn-reset {
  padding: 8px 14px;
  background: #f1f5f9;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 13px;
  color: var(--text-muted);
  text-decoration: none;
}

/* Tables */
.zs-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.zs-table th {
  background: #f8fafc;
  border-bottom: 2px solid var(--border);
  padding: 10px 14px;
  text-align: left;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.zs-table td {
  padding: 12px 14px;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
}

.zs-table tr:hover td { background: #f8fafc; }

/* Forms */
.zs-form-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

.zs-form-group {
  margin-bottom: 16px;
}

.zs-form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 6px;
}

.zs-input, .zs-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
}

.zs-input:focus, .zs-textarea:focus {
  border-color: var(--primary);
  outline: none;
}

.zs-input-sm {
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 13px;
}

.zs-side-box {
  background: #f8fafc;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
}

.zs-side-box h4 { margin: 0 0 14px 0; font-size: 14px; }

/* Badges */
.zs-badge-status {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.zs-status-published, .zs-tip-reviewed { background: #dcfce7; color: #166534; }
.zs-status-draft, .zs-tip-unread { background: #fef3c7; color: #92400e; }
.zs-status-unpublished { background: #fee2e2; color: #991b1b; }

.zs-badge-tag {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  background: #f1f5f9;
  color: #475569;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.zs-tag-feat {
  display: inline-block;
  background: #fef3c7;
  color: #b45309;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 6px;
}

.zs-btn-sm-edit {
  padding: 4px 8px;
  background: #e0f2fe;
  color: #0284c7;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-decoration: none;
  margin-right: 4px;
}

.zs-btn-sm-del {
  padding: 4px 8px;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-decoration: none;
}

.zs-btn-sm-view {
  padding: 4px 8px;
  background: #f1f5f9;
  color: #475569;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-decoration: none;
}

.zs-alert-ok {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-weight: 600;
}

.zs-alert-err {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.zs-dash-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.zs-dash-panel {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 20px;
}

.zs-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.zs-panel-header h3 { margin: 0; font-size: 16px; }

.zs-link-sm {
  font-size: 12px;
  color: var(--primary);
  font-weight: 600;
}

.zs-sections-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.zs-section-edit-card {
  background: #f8fafc;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
}

.zs-sec-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.zs-sec-enable {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 15px;
}

.zs-form-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.zs-filter-form {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.zs-gallery-admin-grid, .zs-media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.zs-gal-admin-item, .zs-media-card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 6px;
  overflow: hidden;
}

.zs-gal-admin-item img, .zs-media-card img {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.zs-gal-admin-body, .zs-media-info {
  padding: 10px;
}

.zs-hotline-num {
  font-family: monospace;
  font-weight: 700;
  color: #dc2626;
  font-size: 14px;
}
`;

  // admin/js/admin.js
  adminFiles['admin/js/admin.js'] = `
document.addEventListener('DOMContentLoaded', () => {
    // Auto slugify helper
    const titleInputs = document.querySelectorAll('input[name="title"], input[name="name"]');
    titleInputs.forEach(input => {
        input.addEventListener('blur', () => {
            const form = input.closest('form');
            const slugInput = form ? form.querySelector('input[name="slug"]') : null;
            if (slugInput && !slugInput.value) {
                slugInput.value = input.value
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '');
            }
        });
    });
});
`;

  return adminFiles;
}
