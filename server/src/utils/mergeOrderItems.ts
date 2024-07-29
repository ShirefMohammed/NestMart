import { OrderItem } from "@shared/types/entitiesTypes";

interface MergedOrderItems {
  [productId: number]: OrderItem;
}

export const mergeOrderItems = (orderItems: OrderItem[]): OrderItem[] => {
  const mergedItems: MergedOrderItems = {};

  orderItems.forEach((item) => {
    if (mergedItems[item.productId]) {
      mergedItems[item.productId].quantity += item.quantity;
    } else {
      mergedItems[item.productId] = { ...item };
    }
  });

  return Object.values(mergedItems);
};
