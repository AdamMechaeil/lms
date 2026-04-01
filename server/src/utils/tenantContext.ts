import { AsyncLocalStorage } from "async_hooks";

// Define the shape of our tenant context
interface TenantContext {
  instituteId: string;
}

// Create the global storage instance
const tenantStorage = new AsyncLocalStorage<TenantContext>();

export const TenantContext = {
  // Method to wrap a function execution with a specific instituteId
  run: <T>(instituteId: string, callback: () => T): T => {
    return tenantStorage.run({ instituteId }, callback);
  },

  // Method to retrieve the current instituteId from anywhere in the app
  getInstituteId: (): string | undefined => {
    const store = tenantStorage.getStore();
    return store?.instituteId;
  },
};
