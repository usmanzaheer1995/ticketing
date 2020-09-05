import Link from 'next/link';

const Header = ({ current_user }) => {
  const links = [
    !current_user && { label: 'Sign Up', href: '/auth/signup' },
    !current_user && { label: 'Sign In', href: '/auth/signin' },
    current_user && { label: 'My Orders', href: '/orders' },
    current_user && { label: 'Sell Tickets', href: '/tickets/new' },
    current_user && { label: 'Sign out', href: '/auth/signout' },
  ]
    .filter(Boolean)
    .map(({ label, href }) => (
      <li key={href} className="nav-item">
        <Link href={href}>
          <a className="navbar-brand">{label}</a>
        </Link>
      </li>
    ));

  return (
    <nav className="navbar navbar-light bg-light">
      <Link href="/">
        <a className="navbar-brand">Ticketing</a>
      </Link>

      <div className="d-flex justify-content-end">
        <ul className="nav d-flex align-items-center">
          {links}
        </ul>
      </div>
    </nav>
  );
}

export default Header;
