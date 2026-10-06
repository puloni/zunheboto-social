export function generateFrontendTemplates(): Record<string, string> {
  const templates: Record<string, string> = {};

  // templates/header.php
  templates['templates/header.php'] = `<?php
/**
 * Zunheboto Social — Public Header Template
 */
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';

$siteName = get_setting('site_name', 'Zunheboto Social');
$siteTitle = get_setting('site_title', 'Zunheboto Social — District News & Civic Directory');
$tagline = get_setting('tagline', 'The heartbeat of Zunheboto town and district');
$logoUrl = get_setting('logo_url', '');
$siteIconUrl = get_setting('site_icon_url', '');
$logoHeightDesktop = get_setting('logo_height_desktop', get_setting('logo_height', '60'));
$logoHeightMobile = get_setting('logo_height_mobile', '44');
$metaDesc = get_setting('default_meta_description', 'Official independent news and business directory for Zunheboto District, Nagaland.');
$ogImage = isset($pageOgImage) ? $pageOgImage : get_setting('og_image', get_setting('social_image_url', $logoUrl));
$canonicalUrl = isset($pageCanonical) ? $pageCanonical : (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";

$db = get_db_connection();

// Load dynamic navigation menus
$headerMenus = [];
if ($db) {
    $mStmt = $db->query("SELECT * FROM zs_menus WHERE menu_group = 'main' ORDER BY sort_order ASC");
    if ($mStmt) {
        $headerMenus = $mStmt->fetchAll();
    }
}
if (empty($headerMenus)) {
    $headerMenus = [
        ['label' => 'Home', 'url' => '/', 'target' => '_self'],
        ['label' => 'News & Articles', 'url' => '/articles', 'target' => '_self'],
        ['label' => 'District Directory', 'url' => '/directory', 'target' => '_self'],
        ['label' => 'Photo Gallery', 'url' => '/gallery', 'target' => '_self'],
        ['label' => 'About Zunheboto', 'url' => '/about', 'target' => '_self'],
        ['label' => 'Contact Desk', 'url' => '/contact', 'target' => '_self']
    ];
}

// Emergency Hotline for Topbar
$topHotline = null;
if ($db) {
    $hStmt = $db->query("SELECT * FROM zs_emergency_hotlines ORDER BY sort_order ASC LIMIT 1");
    if ($hStmt) $topHotline = $hStmt->fetch();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= isset($pageTitle) ? sanitize($pageTitle) . ' | ' : '' ?><?= sanitize($siteTitle ?: $siteName) ?></title>
    <meta name="description" content="<?= isset($metaDesc) ? sanitize($metaDesc) : 'News and civic portal for Zunheboto, Nagaland' ?>">
    <link rel="canonical" href="<?= sanitize($canonicalUrl) ?>">
    
    <!-- Open Graph & Social Media Tags -->
    <meta property="og:site_name" content="<?= sanitize($siteName) ?>">
    <meta property="og:title" content="<?= isset($pageTitle) ? sanitize($pageTitle) . ' | ' : '' ?><?= sanitize($siteTitle ?: $siteName) ?>">
    <meta property="og:description" content="<?= isset($metaDesc) ? sanitize($metaDesc) : 'News and civic portal for Zunheboto, Nagaland' ?>">
    <meta property="og:url" content="<?= sanitize($canonicalUrl) ?>">
    <meta property="og:type" content="<?= isset($ogType) ? sanitize($ogType) : 'website' ?>">
    <?php if ($ogImage): ?>
        <meta property="og:image" content="<?= sanitize($ogImage) ?>">
    <?php endif; ?>
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="<?= isset($pageTitle) ? sanitize($pageTitle) . ' | ' : '' ?><?= sanitize($siteTitle ?: $siteName) ?>">
    <meta name="twitter:description" content="<?= isset($metaDesc) ? sanitize($metaDesc) : 'News and civic portal for Zunheboto, Nagaland' ?>">
    <?php if ($ogImage): ?>
        <meta name="twitter:image" content="<?= sanitize($ogImage) ?>">
    <?php endif; ?>

    <?php if ($siteIconUrl): ?>
        <link rel="icon" href="<?= sanitize($siteIconUrl) ?>">
    <?php endif; ?>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/assets/css/style.css">

    <!-- Responsive Logo Style -->
    <style>
        .zs-logo-img {
            height: <?= (int)$logoHeightMobile ?>px;
            width: auto;
            max-width: 100%;
            object-fit: contain;
        }
        @media (min-width: 768px) {
            .zs-logo-img {
                height: <?= (int)$logoHeightDesktop ?>px;
            }
        }
    </style>

    <!-- Schema.org WebSite JSON-LD -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": <?= json_encode($siteName) ?>,
      "url": <?= json_encode(rtrim(get_setting('site_url', 'https://zunheboto.social'), '/')) ?>,
      "potentialAction": {
        "@type": "SearchAction",
        "target": "<?= rtrim(get_setting('site_url', 'https://zunheboto.social'), '/') ?>/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
    </script>
</head>
<body class="zs-body">

<!-- District Alert & Utility Topbar -->
<div class="zs-topbar">
    <div class="zs-container zs-topbar-inner">
        <div class="zs-topbar-left">
            <span class="zs-topbar-date">📍 Zunheboto, Nagaland &bull; <?= date('l, F j, Y') ?></span>
            <?php if ($topHotline): ?>
                <span class="zs-hotline-pill">🚨 Emergency: <a href="tel:<?= sanitize($topHotline['phone']) ?>" style="color:#fff"><?= sanitize($topHotline['phone']) ?></a></span>
            <?php endif; ?>
        </div>
        <div class="zs-topbar-right">
            <a href="/directory" class="zs-top-link">🏢 Local Directory</a>
            <a href="/gallery" class="zs-top-link">📸 Photo Gallery</a>
            <a href="/admin/login.php" class="zs-top-link zs-admin-link">⚡ Staff Portal</a>
        </div>
    </div>
</div>

<!-- Main Branding Header -->
<header class="zs-header">
    <div class="zs-container zs-header-inner">
        <div class="zs-brand-wrap">
            <a href="/" class="zs-brand-link">
                <?php if ($logoUrl): ?>
                    <img src="<?= sanitize($logoUrl) ?>" alt="<?= sanitize($siteName) ?>" class="zs-logo-img">
                <?php else: ?>
                    <span class="zs-brand-title"><?= sanitize($siteName) ?></span>
                <?php endif; ?>
                <span class="zs-brand-tagline"><?= sanitize($tagline) ?></span>
            </a>
        </div>

        <div class="zs-header-actions">
            <!-- Search bar -->
            <form action="/search" method="GET" class="zs-header-search">
                <input type="text" name="q" placeholder="Search news, business directory..." required>
                <button type="submit" aria-label="Search">🔍</button>
            </form>

            <a href="/#news-tip-section" class="zs-btn-tip">
                <span>📢</span>
                <strong>Submit Citizen Tip</strong>
            </a>

            <button class="zs-mobile-menu-btn" id="zsMobileToggle" aria-label="Toggle Menu">
                <span></span><span></span><span></span>
            </button>
        </div>
    </div>
</header>

<!-- Main Navigation Menu -->
<nav class="zs-nav" id="zsNav">
    <div class="zs-container">
        <ul class="zs-nav-list">
            <?php foreach ($headerMenus as $hm): 
                $isActive = ($_SERVER['REQUEST_URI'] === $hm['url']) || ($hm['url'] !== '/' && strpos($_SERVER['REQUEST_URI'], $hm['url']) === 0);
            ?>
                <li>
                    <a href="<?= sanitize($hm['url']) ?>" target="<?= sanitize($hm['target'] ?? '_self') ?>" class="zs-nav-item <?= $isActive ? 'active' : '' ?>">
                        <?= sanitize($hm['label']) ?>
                    </a>
                </li>
            <?php endforeach; ?>
        </ul>
    </div>
</nav>

<main class="zs-main-content">
`;

  // templates/footer.php
  templates['templates/footer.php'] = `
</main> <!-- end .zs-main-content -->

<?php
$siteName = get_setting('site_name', 'Zunheboto Social');
$copyrightText = get_setting('copyright_text', '© ' . date('Y') . ' Zunheboto Social. All rights reserved.');
$footerText = get_setting('footer_branding_text', 'Zunheboto Social is the dedicated local news portal and civic directory for Zunheboto district, Nagaland.');
$contactEmail = get_setting('contact_email', 'admin@zunheboto.social');
$contactPhone = get_setting('contact_phone', '+91 3867 220 000');
$contactAddress = get_setting('contact_address', 'DC Hill Road, Zunheboto Town, Nagaland — 798620');
$showZip = get_setting('footer_show_zip_download', '1') === '1';

$db = get_db_connection();
$footerMenus = [];
if ($db) {
    $fStmt = $db->query("SELECT * FROM zs_menus WHERE menu_group = 'footer' ORDER BY sort_order ASC");
    if ($fStmt) $footerMenus = $fStmt->fetchAll();
}
if (empty($footerMenus)) {
    $footerMenus = [
        ['label' => 'District News Archive', 'url' => '/articles', 'target' => '_self'],
        ['label' => 'Local Business Directory', 'url' => '/directory', 'target' => '_self'],
        ['label' => 'District in Pictures', 'url' => '/gallery', 'target' => '_self'],
        ['label' => 'About Zunheboto', 'url' => '/about', 'target' => '_self'],
        ['label' => 'Privacy Policy', 'url' => '/privacy', 'target' => '_self'],
        ['label' => 'Contact Editorial Desk', 'url' => '/contact', 'target' => '_self']
    ];
}

$hotlines = $db ? $db->query("SELECT * FROM zs_emergency_hotlines ORDER BY sort_order ASC LIMIT 4")->fetchAll() : [];
?>

<footer class="zs-footer">
    <div class="zs-container">
        <div class="zs-footer-grid">
            <!-- Brand Column -->
            <div class="zs-footer-col">
                <h3 class="zs-footer-brand"><?= sanitize($siteName) ?></h3>
                <p class="zs-footer-desc"><?= sanitize($footerText) ?></p>
                <div class="zs-footer-contacts">
                    <p>📍 <?= sanitize($contactAddress) ?></p>
                    <p>📞 <a href="tel:<?= sanitize($contactPhone) ?>"><?= sanitize($contactPhone) ?></a></p>
                    <p>📧 <a href="mailto:<?= sanitize($contactEmail) ?>"><?= sanitize($contactEmail) ?></a></p>
                </div>
            </div>

            <!-- Navigation Links -->
            <div class="zs-footer-col">
                <h4 class="zs-footer-heading">District Navigation</h4>
                <ul class="zs-footer-links">
                    <?php foreach ($footerMenus as $fm): ?>
                        <li><a href="<?= sanitize($fm['url']) ?>" target="<?= sanitize($fm['target'] ?? '_self') ?>"><?= sanitize($fm['label']) ?></a></li>
                    <?php endforeach; ?>
                </ul>
            </div>

            <!-- Emergency Helplines -->
            <div class="zs-footer-col">
                <h4 class="zs-footer-heading">Emergency Helplines</h4>
                <ul class="zs-footer-hotlines">
                    <?php foreach ($hotlines as $hl): ?>
                        <li>
                            <strong><?= sanitize($hl['title']) ?></strong>:
                            <a href="tel:<?= sanitize($hl['phone']) ?>" class="zs-hl-phone"><?= sanitize($hl['phone']) ?></a>
                        </li>
                    <?php endforeach; ?>
                </ul>
            </div>

            <!-- Editorial Staff -->
            <div class="zs-footer-col">
                <h4 class="zs-footer-heading">Editorial &amp; Staff</h4>
                <p style="font-size:13px;color:#94a3b8;line-height:1.5">
                    Have an urgent local scoop, press release, or community event in Zunheboto or nearby sub-divisions?
                </p>
                <a href="/#news-tip-section" class="zs-btn-tip" style="margin-top:10px;display:inline-flex">Submit News Report &rarr;</a>
                <div style="margin-top:16px">
                    <a href="/admin/login.php" class="zs-staff-badge">⚡ Staff Control Panel</a>
                </div>
            </div>
        </div>

        <div class="zs-footer-bottom">
            <div class="zs-copy-left">
                <?= sanitize($copyrightText) ?>
            </div>
            <div class="zs-copy-right">
                <span>Zunheboto District News &amp; Directory Portal</span>
            </div>
        </div>

        <?php if ($showZip): ?>
        <!-- Deployable Package Download Notice -->
        <div class="zs-zip-bar" id="zsZipBar">
            <div class="zs-zip-inner">
                <div class="zs-zip-info">
                    <span class="zs-zip-icon">📦</span>
                    <div>
                        <strong>Zunheboto Social Standalone PHP &amp; MySQL CMS Package</strong>
                        <p>Complete deployment archive for CyberPanel, cPanel, or Apache/LiteSpeed web servers.</p>
                    </div>
                </div>
                <div class="zs-zip-actions">
                    <a href="/admin/settings.php" class="zs-zip-cfg-link">⚙️ Configure in Admin</a>
                </div>
            </div>
        </div>
        <?php endif; ?>
    </div>
</footer>

<script src="/assets/js/main.js"></script>
</body>
</html>
`;

  // templates/home.php
  templates['templates/home.php'] = `<?php
/**
 * Zunheboto Social — Homepage Dynamic Builder Template
 */
$pageTitle = 'District News & Civic Directory';
require_once __DIR__ . '/header.php';
$db = get_db_connection();

// Process citizen news tip submission if posted from homepage form
$tipSuccess = false;
$tipError = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'submit_tip') {
    $senderName = trim($_POST['sender_name'] ?? '');
    $senderContact = trim($_POST['sender_contact'] ?? '');
    $location = trim($_POST['location'] ?? 'Zunheboto Town');
    $message = trim($_POST['message'] ?? '');

    if (!empty($message) && !empty($senderContact) && $db) {
        $tipId = 'tip_' . time();
        $tStmt = $db->prepare("INSERT INTO zs_news_tips (id, sender_name, sender_contact, location, message, status) VALUES (?, ?, ?, ?, ?, 'unread')");
        $tStmt->execute([$tipId, $senderName, $senderContact, $location, $message]);
        $tipSuccess = true;
    } else {
        $tipError = 'Please provide your contact number and description of the news tip.';
    }
}

// Fetch all enabled homepage sections ordered by sort_order
$sections = [];
if ($db) {
    $sStmt = $db->query("SELECT * FROM zs_homepage_sections WHERE enabled = 1 ORDER BY sort_order ASC");
    if ($sStmt) {
        $sections = $sStmt->fetchAll();
    }
}

// Fallback sections if none configured
if (empty($sections)) {
    $sections = [
        ['section_type' => 'hero_featured', 'title' => 'Top District Story', 'subtitle' => '', 'item_count' => 4],
        ['section_type' => 'latest_articles', 'title' => 'Latest District Reports', 'subtitle' => 'Real-time updates from Zunheboto and surrounding subdivisions', 'item_count' => 6],
        ['section_type' => 'directory_spotlight', 'title' => 'District Directory Spotlight', 'subtitle' => 'Verified local services, healthcare, and essential contacts', 'item_count' => 4],
        ['section_type' => 'photo_gallery', 'title' => 'Zunheboto in Pictures', 'subtitle' => 'Landscapes, landmarks, and cultural moments', 'item_count' => 4],
        ['section_type' => 'news_tip_form', 'title' => 'Citizen News Desk', 'subtitle' => 'Report local news, road conditions, or emergency alerts', 'item_count' => 1]
    ];
}
?>

<div class="zs-container">
    <?php foreach ($sections as $sec): 
        $type = $sec['section_type'];
        $count = (int)($sec['item_count'] ?? 4);
        $title = $sec['title'] ?? '';
        $subtitle = $sec['subtitle'] ?? '';
        $btnText = $sec['button_text'] ?? '';
        $btnUrl = $sec['button_url'] ?? '';
        $catId = $sec['category_id'] ?? '';
    ?>

        <?php if ($type === 'hero_featured'): 
            // Query featured hero story + side stories
            $heroStory = null;
            $sideStories = [];
            if ($db) {
                $hStmt = $db->query("SELECT a.*, c.name as cat_name, c.color as cat_color FROM zs_articles a LEFT JOIN zs_article_categories c ON a.category_id = c.id WHERE a.status = 'published' ORDER BY a.is_featured DESC, a.published_at DESC LIMIT 4");
                $allHero = $hStmt ? $hStmt->fetchAll() : [];
                if (!empty($allHero)) {
                    $heroStory = $allHero[0];
                    $sideStories = array_slice($allHero, 1, 3);
                }
            }
        ?>
            <?php if ($heroStory): ?>
            <section class="zs-hero-section">
                <div class="zs-hero-grid">
                    <!-- Main Lead Story -->
                    <div class="zs-hero-card">
                        <div class="zs-hero-img-wrap">
                            <img src="<?= sanitize($heroStory['featured_image']) ?>" alt="<?= sanitize($heroStory['title']) ?>" class="zs-hero-img">
                            <span class="zs-cat-badge" style="background:<?= sanitize($heroStory['cat_color'] ?? '#0284c7') ?>">
                                <?= sanitize($heroStory['cat_name'] ?? 'Featured News') ?>
                            </span>
                        </div>
                        <div class="zs-hero-body">
                            <h1 class="zs-hero-title">
                                <a href="/article/<?= sanitize($heroStory['slug']) ?>"><?= sanitize($heroStory['title']) ?></a>
                            </h1>
                            <p class="zs-hero-excerpt"><?= sanitize($heroStory['excerpt']) ?></p>
                            <div class="zs-meta-row">
                                <span>✍️ <?= sanitize($heroStory['author_name']) ?></span>
                                <span>🕒 <?= date('M j, Y', strtotime($heroStory['published_at'])) ?></span>
                                <span>⏱️ <?= (int)$heroStory['read_time_minutes'] ?> min read</span>
                            </div>
                        </div>
                    </div>

                    <!-- Secondary Top Stories -->
                    <div class="zs-side-articles">
                        <?php foreach ($sideStories as $ss): ?>
                            <div class="zs-side-card">
                                <img src="<?= sanitize($ss['featured_image']) ?>" alt="<?= sanitize($ss['title']) ?>" class="zs-side-thumb">
                                <div class="zs-side-body">
                                    <span class="zs-side-cat" style="color:<?= sanitize($ss['cat_color'] ?? '#d97706') ?>"><?= sanitize($ss['cat_name'] ?? 'District') ?></span>
                                    <h3 class="zs-side-title"><a href="/article/<?= sanitize($ss['slug']) ?>"><?= sanitize($ss['title']) ?></a></h3>
                                    <span class="zs-side-date"><?= date('M j, Y', strtotime($ss['published_at'])) ?></span>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </section>
            <?php endif; ?>

        <?php elseif ($type === 'breaking_ticker'): 
            $tickerArticles = $db ? $db->query("SELECT title, slug FROM zs_articles WHERE status = 'published' ORDER BY published_at DESC LIMIT 5")->fetchAll() : [];
        ?>
            <?php if (!empty($tickerArticles)): ?>
            <div class="zs-ticker-bar">
                <span class="zs-ticker-label">⚡ LATEST UPDATES:</span>
                <div class="zs-ticker-content">
                    <?php foreach ($tickerArticles as $ta): ?>
                        <a href="/article/<?= sanitize($ta['slug']) ?>" class="zs-ticker-item">&bull; <?= sanitize($ta['title']) ?></a>
                    <?php endforeach; ?>
                </div>
            </div>
            <?php endif; ?>

        <?php elseif ($type === 'featured_stories' || $type === 'latest_articles'): 
            $artQuery = "SELECT a.*, c.name as cat_name, c.color as cat_color FROM zs_articles a LEFT JOIN zs_article_categories c ON a.category_id = c.id WHERE a.status = 'published'";
            if ($catId) $artQuery .= " AND a.category_id = " . $db->quote($catId);
            $artQuery .= " ORDER BY a.published_at DESC LIMIT " . (int)$count;
            $articles = $db ? $db->query($artQuery)->fetchAll() : [];
        ?>
            <section class="zs-section">
                <div class="zs-section-header">
                    <div>
                        <h2 class="zs-section-title"><?= sanitize($title) ?></h2>
                        <?php if ($subtitle): ?><p class="zs-section-sub"><?= sanitize($subtitle) ?></p><?php endif; ?>
                    </div>
                    <?php if ($btnText && $btnUrl): ?>
                        <a href="<?= sanitize($btnUrl) ?>" class="zs-view-all"><?= sanitize($btnText) ?> &rarr;</a>
                    <?php else: ?>
                        <a href="/articles" class="zs-view-all">View All Articles &rarr;</a>
                    <?php endif; ?>
                </div>

                <div class="zs-articles-grid">
                    <?php foreach ($articles as $art): ?>
                        <article class="zs-art-card">
                            <div class="zs-art-thumb-wrap">
                                <img src="<?= sanitize($art['featured_image']) ?>" alt="<?= sanitize($art['title']) ?>" class="zs-art-thumb">
                                <span class="zs-art-cat" style="background:<?= sanitize($art['cat_color'] ?? '#0284c7') ?>"><?= sanitize($art['cat_name'] ?? 'News') ?></span>
                            </div>
                            <div class="zs-art-content">
                                <h3 class="zs-art-title"><a href="/article/<?= sanitize($art['slug']) ?>"><?= sanitize($art['title']) ?></a></h3>
                                <p class="zs-art-desc"><?= sanitize($art['excerpt']) ?></p>
                                <div class="zs-art-meta">
                                    <span><?= date('M j, Y', strtotime($art['published_at'])) ?></span> &bull; 
                                    <span><?= sanitize($art['author_name']) ?></span>
                                </div>
                            </div>
                        </article>
                    <?php endforeach; ?>
                </div>
            </section>

        <?php elseif ($type === 'category_strip'): 
            $cats = $db ? $db->query("SELECT * FROM zs_article_categories ORDER BY sort_order ASC")->fetchAll() : [];
        ?>
            <section class="zs-category-strip">
                <div class="zs-section-header" style="margin-bottom:14px">
                    <h2 class="zs-section-title"><?= sanitize($title ?: 'Explore Categories') ?></h2>
                </div>
                <div class="zs-cat-pills">
                    <?php foreach ($cats as $cat): ?>
                        <a href="/articles?category=<?= urlencode($cat['slug']) ?>" class="zs-cat-pill-btn">
                            <span class="zs-cat-dot" style="background:<?= sanitize($cat['color']) ?>"></span>
                            <?= sanitize($cat['name']) ?>
                        </a>
                    <?php endforeach; ?>
                </div>
            </section>

        <?php elseif ($type === 'directory_spotlight'): 
            $listings = $db ? $db->query("SELECT l.*, c.name as cat_name FROM zs_listings l LEFT JOIN zs_listing_categories c ON l.category_id = c.id WHERE l.status = 'published' ORDER BY l.verified DESC, l.created_at DESC LIMIT " . (int)$count)->fetchAll() : [];
        ?>
            <section class="zs-section">
                <div class="zs-section-header">
                    <div>
                        <h2 class="zs-section-title"><?= sanitize($title ?: 'District Directory Spotlight') ?></h2>
                        <?php if ($subtitle): ?><p class="zs-section-sub"><?= sanitize($subtitle) ?></p><?php endif; ?>
                    </div>
                    <a href="/directory" class="zs-view-all">Browse Complete Directory &rarr;</a>
                </div>

                <div class="zs-directory-grid">
                    <?php foreach ($listings as $listing): ?>
                        <div class="zs-dir-card">
                            <img src="<?= sanitize($listing['featured_image']) ?>" alt="<?= sanitize($listing['name']) ?>" class="zs-dir-thumb">
                            <div class="zs-dir-body">
                                <div class="zs-dir-badge-row">
                                    <span class="zs-dir-cat-badge"><?= sanitize($listing['cat_name'] ?? 'Establishment') ?></span>
                                    <?php if ($listing['verified']): ?>
                                        <span class="zs-verified-badge">✓ Verified</span>
                                    <?php endif; ?>
                                </div>
                                <h3 class="zs-dir-title"><a href="/listing/<?= sanitize($listing['slug']) ?>"><?= sanitize($listing['name']) ?></a></h3>
                                <p class="zs-dir-address">📍 <?= sanitize($listing['address']) ?></p>
                                <div class="zs-dir-actions">
                                    <a href="tel:<?= sanitize($listing['phone']) ?>" class="zs-btn-call">📞 Call</a>
                                    <a href="/listing/<?= sanitize($listing['slug']) ?>" class="zs-btn-details">Details</a>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </section>

        <?php elseif ($type === 'photo_gallery'): 
            $photos = $db ? $db->query("SELECT * FROM zs_gallery ORDER BY sort_order ASC LIMIT " . (int)$count)->fetchAll() : [];
        ?>
            <section class="zs-section">
                <div class="zs-section-header">
                    <div>
                        <h2 class="zs-section-title"><?= sanitize($title ?: 'Zunheboto in Pictures') ?></h2>
                        <?php if ($subtitle): ?><p class="zs-section-sub"><?= sanitize($subtitle) ?></p><?php endif; ?>
                    </div>
                    <a href="/gallery" class="zs-view-all">View Gallery &rarr;</a>
                </div>

                <div class="zs-gallery-grid">
                    <?php foreach ($photos as $p): ?>
                        <div class="zs-gallery-card">
                            <img src="<?= sanitize($p['image_url']) ?>" alt="<?= sanitize($p['title']) ?>" class="zs-gallery-thumb">
                            <div class="zs-gallery-info">
                                <h3 class="zs-gallery-title"><?= sanitize($p['title']) ?></h3>
                                <p class="zs-gallery-cap"><?= sanitize($p['caption']) ?></p>
                                <span class="zs-gallery-meta">📷 <?= sanitize($p['photographer']) ?> &bull; 📍 <?= sanitize($p['location']) ?></span>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </section>

        <?php elseif ($type === 'emergency_hotlines'): 
            $hotlines = $db ? $db->query("SELECT * FROM zs_emergency_hotlines ORDER BY sort_order ASC LIMIT 6")->fetchAll() : [];
        ?>
            <section class="zs-section">
                <div class="zs-section-header">
                    <div>
                        <h2 class="zs-section-title"><?= sanitize($title ?: 'District Emergency Hotlines') ?></h2>
                        <?php if ($subtitle): ?><p class="zs-section-sub"><?= sanitize($subtitle) ?></p><?php endif; ?>
                    </div>
                </div>
                <div class="zs-hotlines-grid">
                    <?php foreach ($hotlines as $hl): ?>
                        <div class="zs-hl-card">
                            <span class="zs-hl-icon">🚨</span>
                            <div class="zs-hl-details">
                                <strong><?= sanitize($hl['title']) ?></strong>
                                <p><?= sanitize($hl['description']) ?></p>
                                <a href="tel:<?= sanitize($hl['phone']) ?>" class="zs-hl-btn">📞 <?= sanitize($hl['phone']) ?></a>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </section>

        <?php elseif ($type === 'district_stats'): ?>
            <section class="zs-stats-strip">
                <div class="zs-stat-box">
                    <span class="zs-sb-num">140,757+</span>
                    <span class="zs-sb-lbl">District Population (2011)</span>
                </div>
                <div class="zs-stat-box">
                    <span class="zs-sb-num">1,874 m</span>
                    <span class="zs-sb-lbl">Elevation / Climate</span>
                </div>
                <div class="zs-stat-box">
                    <span class="zs-sb-num">798620</span>
                    <span class="zs-sb-lbl">Zunheboto PIN Code</span>
                </div>
                <div class="zs-stat-box">
                    <span class="zs-sb-num">Sümi Heartland</span>
                    <span class="zs-sb-lbl">Cultural Heritage</span>
                </div>
            </section>

        <?php elseif ($type === 'news_tip_form'): ?>
            <section class="zs-section zs-tip-box" id="news-tip-section">
                <div class="zs-tip-header">
                    <h2>📢 <?= sanitize($title ?: 'Citizen News Desk & Tip Submission') ?></h2>
                    <p><?= sanitize($subtitle ?: 'Witnessed a breaking event, infrastructure issue, or community milestone in Zunheboto? Send a tip to our reporters.') ?></p>
                </div>

                <?php if ($tipSuccess): ?>
                    <div class="zs-alert-ok">✅ Thank you! Your news tip has been received by the Zunheboto Social editorial desk.</div>
                <?php endif; ?>
                <?php if ($tipError): ?>
                    <div class="zs-alert-err">❌ <?= sanitize($tipError) ?></div>
                <?php endif; ?>

                <form method="POST" class="zs-tip-form">
                    <input type="hidden" name="action" value="submit_tip">
                    <div class="zs-form-row">
                        <div class="zs-form-group" style="flex:1">
                            <label>Your Name (Optional)</label>
                            <input type="text" name="sender_name" class="zs-input" placeholder="Anonymous or Full Name">
                        </div>
                        <div class="zs-form-group" style="flex:1">
                            <label>Phone / WhatsApp Number *</label>
                            <input type="text" name="sender_contact" class="zs-input" placeholder="+91..." required>
                        </div>
                        <div class="zs-form-group" style="flex:1">
                            <label>Colony / Village / Location *</label>
                            <input type="text" name="location" class="zs-input" placeholder="e.g. Project Colony, Satakha" required>
                        </div>
                    </div>
                    <div class="zs-form-group">
                        <label>News Report Details *</label>
                        <textarea name="message" class="zs-textarea" rows="4" placeholder="Describe what happened, location, time, and relevant details..." required></textarea>
                    </div>
                    <button type="submit" class="zs-btn-tip" style="border:none;cursor:pointer;width:100%;justify-content:center;padding:14px">Submit News Tip to Editorial Desk &rarr;</button>
                </form>
            </section>
        <?php endif; ?>

    <?php endforeach; ?>
</div>

<?php require_once __DIR__ . '/footer.php'; ?>
`;

  // templates/articles.php
  templates['templates/articles.php'] = `<?php
/**
 * Zunheboto Social — Articles & News Archive
 */
$pageTitle = 'News & Reports Archive';
require_once __DIR__ . '/header.php';
$db = get_db_connection();

$selectedCat = $_GET['category'] ?? '';
$search = trim($_GET['q'] ?? '');

$categories = $db ? $db->query("SELECT * FROM zs_article_categories ORDER BY sort_order ASC")->fetchAll() : [];

$sql = "SELECT a.*, c.name as cat_name, c.color as cat_color FROM zs_articles a LEFT JOIN zs_article_categories c ON a.category_id = c.id WHERE a.status = 'published'";
$params = [];

if ($selectedCat) {
    $sql .= " AND c.slug = ?";
    $params[] = $selectedCat;
}
if ($search) {
    $sql .= " AND (a.title LIKE ? OR a.content LIKE ?)";
    $params[] = "%$search%";
    $params[] = "%$search%";
}
$sql .= " ORDER BY a.published_at DESC";

$stmt = $db ? $db->prepare($sql) : null;
$articles = [];
if ($stmt) {
    $stmt->execute($params);
    $articles = $stmt->fetchAll();
}
?>
<div class="zs-container">
    <div class="zs-page-header">
        <h1 class="zs-page-title">Zunheboto District News &amp; Reports</h1>
        <p class="zs-page-sub">Verified community reporting, governance updates, and cultural archives across Zunheboto.</p>
    </div>

    <!-- Category Filter Bar -->
    <div class="zs-cat-filter-bar">
        <a href="/articles" class="zs-filter-pill <?= empty($selectedCat) ? 'active' : '' ?>">All News</a>
        <?php foreach ($categories as $c): ?>
            <a href="/articles?category=<?= urlencode($c['slug']) ?>" class="zs-filter-pill <?= $selectedCat === $c['slug'] ? 'active' : '' ?>">
                <span class="zs-dot-sm" style="background:<?= sanitize($c['color']) ?>"></span>
                <?= sanitize($c['name']) ?>
            </a>
        <?php endforeach; ?>
    </div>

    <!-- Articles Grid -->
    <div class="zs-articles-grid" style="margin-top:30px">
        <?php if (!empty($articles)): ?>
            <?php foreach ($articles as $art): ?>
                <article class="zs-art-card">
                    <div class="zs-art-thumb-wrap">
                        <img src="<?= sanitize($art['featured_image']) ?>" alt="<?= sanitize($art['title']) ?>" class="zs-art-thumb">
                        <span class="zs-art-cat" style="background:<?= sanitize($art['cat_color'] ?? '#0284c7') ?>"><?= sanitize($art['cat_name'] ?? 'News') ?></span>
                    </div>
                    <div class="zs-art-content">
                        <h3 class="zs-art-title"><a href="/article/<?= sanitize($art['slug']) ?>"><?= sanitize($art['title']) ?></a></h3>
                        <p class="zs-art-desc"><?= sanitize($art['excerpt']) ?></p>
                        <div class="zs-art-meta">
                            <span>🕒 <?= date('M j, Y', strtotime($art['published_at'])) ?></span> &bull; 
                            <span>✍️ <?= sanitize($art['author_name']) ?></span>
                        </div>
                    </div>
                </article>
            <?php endforeach; ?>
        <?php else: ?>
            <div class="zs-empty-box" style="grid-column:1/-1">
                <h3>No articles found</h3>
                <p>No stories matched your filter criteria. Try clearing the filter or searching for another term.</p>
                <a href="/articles" class="zs-btn-details">View All Articles</a>
            </div>
        <?php endif; ?>
    </div>
</div>
<?php require_once __DIR__ . '/footer.php'; ?>
`;

  // templates/article_single.php
  templates['templates/article_single.php'] = `<?php
/**
 * Zunheboto Social — Single Article Reader
 */
$slug = $_GET['slug'] ?? '';
$db = get_db_connection();

$stmt = $db ? $db->prepare("SELECT a.*, c.name as cat_name, c.color as cat_color FROM zs_articles a LEFT JOIN zs_article_categories c ON a.category_id = c.id WHERE a.slug = ? AND a.status = 'published'") : null;
$article = null;
if ($stmt) {
    $stmt->execute([$slug]);
    $article = $stmt->fetch();
    if ($article) {
        // Increment view count
        $db->query("UPDATE zs_articles SET views = views + 1 WHERE id = " . $db->quote($article['id']));
    }
}

if (!$article) {
    http_response_code(404);
    require_once __DIR__ . '/404.php';
    exit;
}

$pageTitle = $article['seo_title'] ?: $article['title'];
$metaDesc = $article['meta_description'] ?: $article['excerpt'];
$pageOgImage = $article['featured_image'] ?: '';
$ogType = 'article';
$siteBase = rtrim(get_setting('site_url', 'https://zunheboto.social'), '/');
$pageCanonical = $siteBase . '/article/' . $article['slug'];
$currentUrl = $pageCanonical;

// Related articles from same category
$relatedArticles = [];
if ($db && !empty($article['category_id'])) {
    $rStmt = $db->prepare("SELECT * FROM zs_articles WHERE category_id = ? AND id != ? AND status = 'published' ORDER BY published_at DESC LIMIT 3");
    $rStmt->execute([$article['category_id'], $article['id']]);
    $relatedArticles = $rStmt->fetchAll();
}

require_once __DIR__ . '/header.php';
?>
<!-- NewsArticle Structured Data -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": <?= json_encode($article['title']) ?>,
  "description": <?= json_encode($article['excerpt']) ?>,
  "image": [<?= json_encode($article['featured_image']) ?>],
  "datePublished": <?= json_encode($article['published_at']) ?>,
  "dateModified": <?= json_encode($article['updated_at'] ?: $article['published_at']) ?>,
  "author": [{
    "@type": "Person",
    "name": <?= json_encode($article['author_name']) ?>
  }],
  "publisher": {
    "@type": "Organization",
    "name": <?= json_encode($siteName) ?>,
    "logo": {
      "@type": "ImageObject",
      "url": <?= json_encode($logoUrl) ?>
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": <?= json_encode($pageCanonical) ?>
  }
}
</script>

<div class="zs-container zs-reader-container">
    <article class="zs-single-article">
        <div class="zs-single-header">
            <span class="zs-cat-pill" style="background:<?= sanitize($article['cat_color'] ?? '#0284c7') ?>;color:#fff">
                <?= sanitize($article['cat_name'] ?? 'District News') ?>
            </span>
            <h1 class="zs-single-title"><?= sanitize($article['title']) ?></h1>
            <div class="zs-single-meta">
                <span>✍️ By <a href="/author/<?= urlencode(slugify($article['author_name'])) ?>" style="color:inherit;text-decoration:underline"><strong><?= sanitize($article['author_name']) ?></strong></a></span>
                <span>📅 Published on <?= date('F j, Y \a\t g:i A', strtotime($article['published_at'])) ?></span>
                <span>⏱️ <?= (int)$article['read_time_minutes'] ?> min read</span>
                <span>👁️ <?= number_format((int)$article['views']) ?> views</span>
            </div>
        </div>

        <?php if (!empty($article['featured_image'])): ?>
            <div class="zs-single-featured-img">
                <img src="<?= sanitize($article['featured_image']) ?>" alt="<?= sanitize($article['title']) ?>">
            </div>
        <?php endif; ?>

        <div class="zs-single-body">
            <?= nl2br(sanitize($article['content'])) ?>
        </div>

        <?php if (!empty($article['tags'])): ?>
            <div class="zs-single-tags">
                <strong>Tags:</strong>
                <?php foreach (explode(',', $article['tags']) as $t): $t = trim($t); if ($t): ?>
                    <span class="zs-tag-badge">#<?= sanitize($t) ?></span>
                <?php endif; endforeach; ?>
            </div>
        <?php endif; ?>

        <!-- Social Share Bar -->
        <div class="zs-share-bar">
            <span class="zs-share-label">Share this story:</span>
            <div class="zs-share-buttons">
                <a href="https://wa.me/?text=<?= urlencode($article['title'] . ' ' . $currentUrl) ?>" target="_blank" class="zs-btn-share zs-share-wa">📱 WhatsApp</a>
                <a href="https://www.facebook.com/sharer/sharer.php?u=<?= urlencode($currentUrl) ?>" target="_blank" class="zs-btn-share zs-share-fb">Facebook</a>
                <a href="https://twitter.com/intent/tweet?text=<?= urlencode($article['title']) ?>&url=<?= urlencode($currentUrl) ?>" target="_blank" class="zs-btn-share zs-share-tw">Twitter / X</a>
                <button onclick="navigator.clipboard.writeText(window.location.href);alert('Article link copied to clipboard!');" class="zs-btn-share zs-share-copy">🔗 Copy Link</button>
            </div>
        </div>
    </article>

    <?php if (!empty($relatedArticles)): ?>
        <section class="zs-related-section">
            <h3>Related District Reports</h3>
            <div class="zs-articles-grid">
                <?php foreach ($relatedArticles as $ra): ?>
                    <article class="zs-art-card">
                        <img src="<?= sanitize($ra['featured_image']) ?>" alt="<?= sanitize($ra['title']) ?>" class="zs-art-thumb">
                        <div class="zs-art-content">
                            <h4 class="zs-art-title"><a href="/article/<?= sanitize($ra['slug']) ?>"><?= sanitize($ra['title']) ?></a></h4>
                            <p class="zs-art-desc"><?= sanitize($ra['excerpt']) ?></p>
                        </div>
                    </article>
                <?php endforeach; ?>
            </div>
        </section>
    <?php endif; ?>
</div>
<?php require_once __DIR__ . '/footer.php'; ?>
`;

  // templates/directory.php
  templates['templates/directory.php'] = `<?php
/**
 * Zunheboto Social — District Directory Archive
 */
$pageTitle = 'Zunheboto District Directory';
require_once __DIR__ . '/header.php';
$db = get_db_connection();

$selectedCat = $_GET['category'] ?? '';
$search = trim($_GET['q'] ?? '');

$categories = $db ? $db->query("SELECT * FROM zs_listing_categories ORDER BY name ASC")->fetchAll() : [];

$sql = "SELECT l.*, c.name as cat_name FROM zs_listings l LEFT JOIN zs_listing_categories c ON l.category_id = c.id WHERE l.status = 'published'";
$params = [];

if ($selectedCat) {
    $sql .= " AND c.slug = ?";
    $params[] = $selectedCat;
}
if ($search) {
    $sql .= " AND (l.name LIKE ? OR l.description LIKE ? OR l.address LIKE ? OR l.location_area LIKE ?)";
    $params[] = "%$search%";
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
<div class="zs-container">
    <div class="zs-page-header">
        <h1 class="zs-page-title">Zunheboto District Directory</h1>
        <p class="zs-page-sub">Verified contacts, addresses, emergency numbers, and listings for local establishments.</p>
    </div>

    <!-- Category Filter Bar -->
    <div class="zs-cat-filter-bar">
        <a href="/directory" class="zs-filter-pill <?= empty($selectedCat) ? 'active' : '' ?>">All Categories</a>
        <?php foreach ($categories as $c): ?>
            <a href="/directory?category=<?= urlencode($c['slug']) ?>" class="zs-filter-pill <?= $selectedCat === $c['slug'] ? 'active' : '' ?>">
                <?= sanitize($c['name']) ?>
            </a>
        <?php endforeach; ?>
    </div>

    <!-- Directory Grid -->
    <div class="zs-directory-grid" style="margin-top:30px">
        <?php if (!empty($listings)): ?>
            <?php foreach ($listings as $listing): ?>
                <div class="zs-dir-card">
                    <img src="<?= sanitize($listing['featured_image']) ?>" alt="<?= sanitize($listing['name']) ?>" class="zs-dir-thumb">
                    <div class="zs-dir-body">
                        <div class="zs-dir-badge-row">
                            <span class="zs-dir-cat-badge"><?= sanitize($listing['cat_name'] ?? 'Establishment') ?></span>
                            <?php if ($listing['verified']): ?>
                                <span class="zs-verified-badge">✓ Verified</span>
                            <?php endif; ?>
                        </div>
                        <h3 class="zs-dir-title"><a href="/listing/<?= sanitize($listing['slug']) ?>"><?= sanitize($listing['name']) ?></a></h3>
                        <p class="zs-dir-address">📍 <?= sanitize($listing['address']) ?></p>
                        <div class="zs-dir-actions">
                            <?php if (!empty($listing['phone'])): ?>
                                <a href="tel:<?= sanitize($listing['phone']) ?>" class="zs-btn-call">📞 Call Now</a>
                            <?php endif; ?>
                            <?php if (!empty($listing['whatsapp'])): ?>
                                <a href="https://wa.me/<?= preg_replace('/[^0-9]/', '', $listing['whatsapp']) ?>" target="_blank" class="zs-btn-wa">WhatsApp</a>
                            <?php endif; ?>
                            <?php if (!empty($listing['map_url'])): ?>
                                <a href="<?= sanitize($listing['map_url']) ?>" target="_blank" class="zs-btn-dir">🗺️ Directions</a>
                            <?php endif; ?>
                            <a href="/listing/<?= sanitize($listing['slug']) ?>" class="zs-btn-details">View Details</a>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php else: ?>
            <div class="zs-empty-box" style="grid-column:1/-1">
                <h3>No directory listings found</h3>
                <p>Try searching another keyword or clearing category filters.</p>
                <a href="/directory" class="zs-btn-details">View All Listings</a>
            </div>
        <?php endif; ?>
    </div>
</div>
<?php require_once __DIR__ . '/footer.php'; ?>
`;

  // templates/listing_single.php
  templates['templates/listing_single.php'] = `<?php
/**
 * Zunheboto Social — Single Directory Listing Reader
 */
$slug = $_GET['slug'] ?? '';
$db = get_db_connection();

$stmt = $db ? $db->prepare("SELECT l.*, c.name as cat_name FROM zs_listings l LEFT JOIN zs_listing_categories c ON l.category_id = c.id WHERE l.slug = ? AND l.status = 'published'") : null;
$listing = null;
if ($stmt) {
    $stmt->execute([$slug]);
    $listing = $stmt->fetch();
}

if (!$listing) {
    http_response_code(404);
    require_once __DIR__ . '/404.php';
    exit;
}

$pageTitle = $listing['name'] . ' — Zunheboto Directory';
$metaDesc = $listing['description'] ? substr(strip_tags($listing['description']), 0, 160) : ($listing['name'] . ' in Zunheboto directory');
$pageOgImage = $listing['featured_image'] ?: '';
$ogType = 'business.business';
$siteBase = rtrim(get_setting('site_url', 'https://zunheboto.social'), '/');
$pageCanonical = $siteBase . '/listing/' . $listing['slug'];

require_once __DIR__ . '/header.php';
?>
<!-- LocalBusiness Structured Data -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": <?= json_encode($listing['name']) ?>,
  "description": <?= json_encode($listing['description']) ?>,
  "image": <?= json_encode($listing['featured_image']) ?>,
  "telephone": <?= json_encode($listing['phone']) ?>,
  "address": {
    "@type": "PostalAddress",
    "streetAddress": <?= json_encode($listing['address']) ?>,
    "addressLocality": <?= json_encode($listing['location_area'] ?: 'Zunheboto') ?>,
    "addressRegion": "Nagaland",
    "postalCode": "798620",
    "addressCountry": "IN"
  }
}
</script>

<div class="zs-container zs-reader-container">
    <div class="zs-listing-page">
        <div class="zs-listing-header">
            <span class="zs-cat-pill"><?= sanitize($listing['cat_name'] ?? 'Directory') ?></span>
            <h1 class="zs-single-title"><?= sanitize($listing['name']) ?></h1>
            <?php if ($listing['verified']): ?>
                <span class="zs-verified-badge" style="display:inline-block;margin-top:8px">✓ Officially Verified Listing</span>
            <?php endif; ?>
        </div>

        <?php if (!empty($listing['featured_image'])): ?>
            <div class="zs-single-featured-img">
                <img src="<?= sanitize($listing['featured_image']) ?>" alt="<?= sanitize($listing['name']) ?>">
            </div>
        <?php endif; ?>

        <div class="zs-listing-info-card">
            <h3>Contact &amp; Location Details</h3>
            <div class="zs-info-grid">
                <p>📍 <strong>Address:</strong> <?= sanitize($listing['address']) ?> (<?= sanitize($listing['location_area']) ?>)</p>
                <p>📞 <strong>Phone:</strong> <a href="tel:<?= sanitize($listing['phone']) ?>"><?= sanitize($listing['phone']) ?></a></p>
                <?php if (!empty($listing['whatsapp'])): ?><p>📱 <strong>WhatsApp:</strong> <a href="https://wa.me/<?= preg_replace('/[^0-9]/', '', $listing['whatsapp']) ?>" target="_blank"><?= sanitize($listing['whatsapp']) ?></a></p><?php endif; ?>
                <?php if (!empty($listing['email'])): ?><p>📧 <strong>Email:</strong> <a href="mailto:<?= sanitize($listing['email']) ?>"><?= sanitize($listing['email']) ?></a></p><?php endif; ?>
                <?php if (!empty($listing['website'])): ?><p>🌐 <strong>Website:</strong> <a href="<?= sanitize($listing['website']) ?>" target="_blank"><?= sanitize($listing['website']) ?></a></p><?php endif; ?>
                <?php if (!empty($listing['opening_hours'])): ?><p>🕒 <strong>Hours:</strong> <?= sanitize($listing['opening_hours']) ?></p><?php endif; ?>
            </div>
        </div>

        <div class="zs-single-body">
            <h3>About this Establishment</h3>
            <?= nl2br(sanitize($listing['description'])) ?>
        </div>
    </div>
</div>
<?php require_once __DIR__ . '/footer.php'; ?>
`;

  // templates/gallery.php
  templates['templates/gallery.php'] = `<?php
/**
 * Zunheboto Social — Photo Gallery
 */
$pageTitle = 'Zunheboto Photo Gallery — District in Pictures';
require_once __DIR__ . '/header.php';
$db = get_db_connection();

$photos = $db ? $db->query("SELECT * FROM zs_gallery ORDER BY sort_order ASC")->fetchAll() : [];
?>
<div class="zs-container">
    <div class="zs-page-header">
        <h1 class="zs-page-title">Zunheboto District Photo Gallery</h1>
        <p class="zs-page-sub">Landscapes, cultural festivals, landmarks, and daily community life across the Sumi heartland.</p>
    </div>

    <div class="zs-gallery-grid">
        <?php foreach ($photos as $p): ?>
            <div class="zs-gallery-card">
                <img src="<?= sanitize($p['image_url']) ?>" alt="<?= sanitize($p['title']) ?>" class="zs-gallery-thumb">
                <div class="zs-gallery-info">
                    <h3 class="zs-gallery-title"><?= sanitize($p['title']) ?></h3>
                    <p class="zs-gallery-cap"><?= sanitize($p['caption']) ?></p>
                    <span class="zs-gallery-meta">📷 <?= sanitize($p['photographer']) ?> &bull; 📍 <?= sanitize($p['location']) ?></span>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
</div>
<?php require_once __DIR__ . '/footer.php'; ?>
`;

  // templates/search.php
  templates['templates/search.php'] = `<?php
/**
 * Zunheboto Social — Search Results
 */
$q = trim($_GET['q'] ?? '');
$pageTitle = 'Search: ' . ($q ? $q : 'Archive');
require_once __DIR__ . '/header.php';
$db = get_db_connection();

$articles = [];
$listings = [];
if ($db && !empty($q)) {
    $aStmt = $db->prepare("SELECT * FROM zs_articles WHERE status = 'published' AND (title LIKE ? OR content LIKE ?) ORDER BY published_at DESC LIMIT 10");
    $aStmt->execute(["%$q%", "%$q%"]);
    $articles = $aStmt->fetchAll();

    $lStmt = $db->prepare("SELECT * FROM zs_listings WHERE status = 'published' AND (name LIKE ? OR description LIKE ?) LIMIT 10");
    $lStmt->execute(["%$q%", "%$q%"]);
    $listings = $lStmt->fetchAll();
}
?>
<div class="zs-container">
    <div class="zs-page-header">
        <h1 class="zs-page-title">Search Results for "<?= sanitize($q) ?>"</h1>
    </div>

    <form action="/search" method="GET" class="zs-search-form" style="margin-bottom:30px">
        <input type="text" name="q" value="<?= sanitize($q) ?>" class="zs-input" placeholder="Search news, business directory, or local topics..." required>
        <button type="submit" class="zs-btn-submit" style="width:auto;margin-top:0">Search</button>
    </form>

    <?php if (!empty($articles)): ?>
        <h2>News Articles (<?= count($articles) ?>)</h2>
        <div class="zs-articles-grid" style="margin-bottom:40px">
            <?php foreach ($articles as $art): ?>
                <article class="zs-art-card">
                    <a href="/article/<?= sanitize($art['slug']) ?>" class="zs-art-link">
                        <img src="<?= sanitize($art['featured_image']) ?>" alt="<?= sanitize($art['title']) ?>" class="zs-art-thumb">
                        <div class="zs-art-content">
                            <h3 class="zs-art-title"><?= sanitize($art['title']) ?></h3>
                            <p class="zs-art-desc"><?= sanitize($art['excerpt']) ?></p>
                        </div>
                    </a>
                </article>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>

    <?php if (!empty($listings)): ?>
        <h2>Directory Listings (<?= count($listings) ?>)</h2>
        <div class="zs-directory-grid">
            <?php foreach ($listings as $l): ?>
                <div class="zs-dir-card">
                    <img src="<?= sanitize($l['featured_image']) ?>" alt="<?= sanitize($l['name']) ?>" class="zs-dir-thumb">
                    <div class="zs-dir-body">
                        <h3 class="zs-dir-title"><a href="/listing/<?= sanitize($l['slug']) ?>"><?= sanitize($l['name']) ?></a></h3>
                        <p class="zs-dir-address">📍 <?= sanitize($l['address']) ?></p>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>

    <?php if (empty($articles) && empty($listings) && !empty($q)): ?>
        <div class="zs-empty-box">
            <h3>No results found for "<?= sanitize($q) ?>"</h3>
            <p>Try different keywords or browse our main sections.</p>
        </div>
    <?php endif; ?>
</div>
<?php require_once __DIR__ . '/footer.php'; ?>
`;

  // templates/author_profile.php
  templates['templates/author_profile.php'] = `<?php
/**
 * Zunheboto Social — Author Profile Archive
 */
$authorSlug = $_GET['author'] ?? '';
$db = get_db_connection();

// Match author by user username or article author_name
$authorUser = null;
if ($db && $authorSlug) {
    $uStmt = $db->prepare("SELECT * FROM zs_users WHERE username = ? OR REPLACE(LOWER(name), ' ', '-') = ? LIMIT 1");
    $uStmt->execute([$authorSlug, $authorSlug]);
    $authorUser = $uStmt->fetch();
}

$authorName = $authorUser ? $authorUser['name'] : ucwords(str_replace('-', ' ', $authorSlug));
$authorBio = $authorUser['bio'] ?? 'Staff reporter and community contributor for Zunheboto Social.';
$authorAvatar = $authorUser['avatar_url'] ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200';

$articles = [];
if ($db) {
    $aStmt = $db->prepare("SELECT a.*, c.name as cat_name, c.color as cat_color FROM zs_articles a LEFT JOIN zs_article_categories c ON a.category_id = c.id WHERE a.status = 'published' AND (a.author_name LIKE ? OR a.author_id = ?) ORDER BY a.published_at DESC");
    $aStmt->execute(['%' . $authorName . '%', $authorUser ? $authorUser['id'] : 0]);
    $articles = $aStmt->fetchAll();
}

$pageTitle = $authorName . ' — Author Archive';
$metaDesc = 'Articles and journalistic reporting by ' . $authorName . ' on Zunheboto Social.';
$siteBase = rtrim(get_setting('site_url', 'https://zunheboto.social'), '/');
$pageCanonical = $siteBase . '/author/' . urlencode($authorSlug);
require_once __DIR__ . '/header.php';
?>
<div class="zs-container">
    <div class="zs-author-banner" style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:32px;margin:30px 0;display:flex;gap:24px;align-items:center;box-shadow:0 1px 3px rgba(0,0,0,0.05)">
        <img src="<?= sanitize($authorAvatar) ?>" alt="<?= sanitize($authorName) ?>" style="width:88px;height:88px;border-radius:50%;object-fit:cover;border:3px solid #0284c7">
        <div>
            <span style="font-size:12px;font-weight:700;color:#0284c7;text-transform:uppercase;letter-spacing:1px">Editorial Staff &amp; Contributor</span>
            <h1 style="font-size:28px;margin:4px 0 8px;color:#0f172a"><?= sanitize($authorName) ?></h1>
            <p style="margin:0;color:#64748b;line-height:1.6"><?= sanitize($authorBio) ?></p>
        </div>
    </div>

    <div class="zs-cat-header" style="margin-bottom:20px">
        <h2 style="font-size:20px;color:#0f172a">Articles by <?= sanitize($authorName) ?> (<?= count($articles) ?>)</h2>
    </div>

    <div class="zs-article-grid">
        <?php if (!empty($articles)): ?>
            <?php foreach ($articles as $a): ?>
                <article class="zs-article-card">
                    <img src="<?= sanitize($a['featured_image']) ?>" alt="<?= sanitize($a['title']) ?>" class="zs-card-thumb">
                    <div class="zs-card-body">
                        <span class="zs-cat-badge" style="background:<?= sanitize($a['cat_color'] ?? '#0284c7') ?>"><?= sanitize($a['cat_name'] ?? 'News') ?></span>
                        <h3 class="zs-card-title"><a href="/article/<?= sanitize($a['slug']) ?>"><?= sanitize($a['title']) ?></a></h3>
                        <p class="zs-card-excerpt"><?= sanitize($a['excerpt']) ?></p>
                        <div class="zs-card-footer">
                            <span><?= date('M j, Y', strtotime($a['published_at'])) ?></span>
                            <a href="/article/<?= sanitize($a['slug']) ?>" class="zs-read-more">Read &rarr;</a>
                        </div>
                    </div>
                </article>
            <?php endforeach; ?>
        <?php else: ?>
            <div class="zs-empty-box" style="grid-column:1/-1">
                <p>No published articles found for this author yet.</p>
                <a href="/articles" class="zs-btn-call">Browse All News</a>
            </div>
        <?php endif; ?>
    </div>
</div>
<?php require_once __DIR__ . '/footer.php'; ?>
`;

  // templates/page_single.php
  templates['templates/page_single.php'] = `<?php
/**
 * Zunheboto Social — Static Page Template
 */
$pageTitle = $page['seo_title'] ?: $page['title'];
$metaDesc = $page['meta_description'] ?: '';
require_once __DIR__ . '/header.php';
?>
<div class="zs-container zs-reader-container">
    <article class="zs-single-article">
        <h1 class="zs-page-title"><?= sanitize($page['title']) ?></h1>
        <?php if (!empty($page['featured_image'])): ?>
            <div class="zs-single-featured-img">
                <img src="<?= sanitize($page['featured_image']) ?>" alt="<?= sanitize($page['title']) ?>">
            </div>
        <?php endif; ?>
        <div class="zs-single-body">
            <?= nl2br(sanitize($page['content'])) ?>
        </div>
    </article>
</div>
<?php require_once __DIR__ . '/footer.php'; ?>
`;

  // templates/404.php
  templates['templates/404.php'] = `<?php
/**
 * Zunheboto Social — 404 Not Found Template
 */
$pageTitle = 'Page Not Found (404)';
require_once __DIR__ . '/header.php';
?>
<div class="zs-container">
    <div class="zs-empty-box" style="padding:80px 20px;text-align:center">
        <h1 style="font-size:64px;color:#0b192c;margin:0">404</h1>
        <h2>Page Not Found</h2>
        <p>The page or article you are looking for has been moved or does not exist.</p>
        <div style="margin-top:20px;display:flex;gap:12px;justify-content:center">
            <a href="/" class="zs-btn-details">Return to Homepage</a>
            <a href="/articles" class="zs-btn-call">Browse All News</a>
        </div>
    </div>
</div>
<?php require_once __DIR__ . '/footer.php'; ?>
`;

  return templates;
}
