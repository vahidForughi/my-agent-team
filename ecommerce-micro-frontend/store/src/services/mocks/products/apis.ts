import MockAdapter from 'axios-mock-adapter';
import { createEndpoint, createResponse } from '../utils';
import { mockProducts, mockBrands, mockTypes } from './data';

const ENDPOINT = '/api/v1/mock/Catalog';

export default function register(mockAdapter: MockAdapter) {
  // GET /Catalog/GetAllProducts with pagination and filtering
  mockAdapter
    .onGet(createEndpoint(`${ENDPOINT}/GetAllProducts`))
    .reply((config) => {
      const params = config.params || {};
      const pageIndex = parseInt(params.pageIndex || params.pageNumber) || 1;
      const pageSize = parseInt(params.pageSize) || 10;

      let filtered = [...mockProducts];

      // Filter by brand
      if (params.brandId) {
        const brandName = mockBrands.find((b) => b.id === params.brandId)?.name;
        if (brandName) {
          filtered = filtered.filter((p) => p.productBrand === brandName);
        }
      }

      // Filter by type
      if (params.typeId) {
        const typeName = mockTypes.find((t) => t.id === params.typeId)?.name;
        if (typeName) {
          filtered = filtered.filter((p) => p.productType === typeName);
        }
      }

      // Search
      if (params.search) {
        const search = params.search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(search) ||
            p.description.toLowerCase().includes(search)
        );
      }

      // Sorting
      if (params.sort) {
        switch (params.sort) {
          case 'priceAsc':
            filtered.sort((a, b) => a.price - b.price);
            break;
          case 'priceDesc':
            filtered.sort((a, b) => b.price - a.price);
            break;
          case 'nameAsc':
            filtered.sort((a, b) => a.name.localeCompare(b.name));
            break;
          case 'nameDesc':
            filtered.sort((a, b) => b.name.localeCompare(a.name));
            break;
        }
      }

      // Pagination
      const start = (pageIndex - 1) * pageSize;
      const paginatedData = filtered.slice(start, start + pageSize);

      return [
        200,
        createResponse({
          pageIndex,
          pageSize,
          count: filtered.length,
          data: paginatedData,
        }),
      ];
    });

  // GET /Catalog/GetProductById/:id
  mockAdapter
    .onGet(new RegExp(`${ENDPOINT}/GetProductById/.*`))
    .reply((config) => {
      const id = config.url?.split('/').pop();
      const product = mockProducts.find((p) => p.id === id);
      return product
        ? [200, createResponse(product)]
        : [404, { error: 'Product not found' }];
    });

  // GET /Catalog/GetAllBrands
  mockAdapter
    .onGet(createEndpoint(`${ENDPOINT}/GetAllBrands`))
    .reply(200, createResponse(mockBrands));

  // GET /Catalog/GetAllTypes
  mockAdapter
    .onGet(createEndpoint(`${ENDPOINT}/GetAllTypes`))
    .reply(200, createResponse(mockTypes));
}
