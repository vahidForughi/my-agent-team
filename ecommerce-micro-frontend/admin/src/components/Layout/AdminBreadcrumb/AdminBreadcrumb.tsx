import React, { useMemo } from 'react';
import { Breadcrumb, theme } from 'antd';
import { useLocation, Link } from '@tanstack/react-router';

/**
 * AdminBreadcrumb Component
 *
 * SOLID Principles Applied:
 * - SRP: Single responsibility for breadcrumb navigation
 */
function AdminBreadcrumb() {
  // 1. Other hooks
  const location = useLocation();
  const { token } = theme.useToken();

  // 2. Memoized values
  const breadcrumbItems = useMemo(() => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    const items: Array<{ title: React.ReactNode }> = [
      {
        title: <Link to="/">Dashboard</Link>,
      },
    ];

    if (pathnames.length > 0) {
      pathnames.forEach((path, index) => {
        const isLast = index === pathnames.length - 1;
        const href = '/' + pathnames.slice(0, index + 1).join('/');
        const title = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');

        items.push({
          title: isLast ? title : <Link to={href}>{title}</Link>,
        });
      });
    }

    return items;
  }, [location.pathname]);

  // 3. Main render
  return (
    <Breadcrumb
      items={breadcrumbItems}
      style={{
        marginBottom: token.sizeUnit * 4,
      }}
    />
  );
}

export default React.memo(AdminBreadcrumb);

