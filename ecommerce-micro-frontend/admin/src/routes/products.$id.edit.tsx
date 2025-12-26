import { createFileRoute } from '@tanstack/react-router';
import ProductForm from '../pages/Products/ProductForm';

export const Route = createFileRoute('/products/$id/edit')({
  component: () => {
    const { id } = Route.useParams();
    return <ProductForm productId={id} />;
  },
});

