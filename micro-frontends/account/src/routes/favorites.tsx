import { createFileRoute } from '@tanstack/react-router';
import Favorites from '../pages/Favorites';

export const Route = createFileRoute('/favorites')({
  component: FavoritesRoute,
});

function FavoritesRoute() {
  const { config } = Route.useRouteContext();

  return <Favorites config={config} />;
}
