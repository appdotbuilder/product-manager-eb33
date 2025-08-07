
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas
import { 
  loginInputSchema, 
  createProductInputSchema, 
  updateProductInputSchema, 
  getProductInputSchema, 
  deleteProductInputSchema 
} from './schema';

// Import handlers
import { login } from './handlers/login';
import { createProduct } from './handlers/create_product';
import { getProducts } from './handlers/get_products';
import { getProduct } from './handlers/get_product';
import { updateProduct } from './handlers/update_product';
import { deleteProduct } from './handlers/delete_product';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

// Mock middleware for authentication (for /auth routes)
const authMiddleware = t.middleware(({ next }) => {
  // This is a placeholder! Real implementation would:
  // 1. Check for JWT token in headers
  // 2. Verify token validity
  // 3. Extract user data from token
  // 4. Pass user context to procedures
  return next({
    ctx: {
      user: { id: 1, email: 'user@example.com' } // Mock authenticated user
    }
  });
});

const authenticatedProcedure = publicProcedure.use(authMiddleware);

const appRouter = router({
  // Public routes
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  login: publicProcedure
    .input(loginInputSchema)
    .mutation(({ input }) => login(input)),

  // Protected routes under /auth path
  auth: router({
    // Product CRUD operations
    createProduct: authenticatedProcedure
      .input(createProductInputSchema)
      .mutation(({ input }) => createProduct(input)),
    
    getProducts: authenticatedProcedure
      .query(() => getProducts()),
    
    getProduct: authenticatedProcedure
      .input(getProductInputSchema)
      .query(({ input }) => getProduct(input)),
    
    updateProduct: authenticatedProcedure
      .input(updateProductInputSchema)
      .mutation(({ input }) => updateProduct(input)),
    
    deleteProduct: authenticatedProcedure
      .input(deleteProductInputSchema)
      .mutation(({ input }) => deleteProduct(input)),
  }),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
