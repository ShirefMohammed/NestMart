import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { PuffLoader } from "react-spinners";
import { Socket } from "socket.io-client";

import { CreateOrderResponse } from "@shared/types/apiTypes";
import { Product } from "@shared/types/entitiesTypes";

import { cartAPI } from "../../../api/cartAPI";
import { OrderItem, ordersAPI } from "../../../api/ordersAPI";
import { useNotify } from "../../../hooks";
import { removeFromCart } from "../../../store/slices/cartSlice";

const CartItems = ({ cartProducts, socket }: { cartProducts: Product[]; socket: Socket }) => {
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [createOrderLoad, setCreateOrderLoad] = useState<boolean>(false);
  const notify = useNotify();

  useEffect(() => {
    if (cartProducts.length > 0) {
      setOrderItems(
        cartProducts.map((product: Product) => ({
          product: product,
          quantity: 1,
        })),
      );
    }
  }, [cartProducts]);

  const createOrder = async () => {
    try {
      setCreateOrderLoad(true);

      const orderItemsData: OrderItem[] = orderItems.map((orderItem) => {
        return { productId: orderItem.product._id, quantity: orderItem.quantity };
      });

      if (orderItemsData.length === 0) return notify("info", "Your cart is empty");

      const res = await ordersAPI.createOrder(orderItemsData);

      const data: CreateOrderResponse = res.data.data;

      socket.emit("sendNotification", data.orderNotification);

      notify("success", "Order is created");
    } catch (err) {
      if (!err?.response) {
        notify("error", "No Server Response");
      } else {
        const message = err.response?.data?.message;
        message ? notify("error", message) : notify("error", "Create order fail!");
      }
    } finally {
      setCreateOrderLoad(false);
    }
  };

  return (
    <section>
      {/* Title */}
      <h2 className="pb-3 mb-4 border-b border-slate-200 font-bold text-lg">Your Cart</h2>

      {/* Cart Products Table */}
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left rtl:text-right shadow-lg border border-slate-300">
          <thead>
            <tr className="text-sm font-bold text-body bg-whiten">
              <th scope="col" className="px-6 py-3">
                Product Image
              </th>
              <th scope="col" className="px-6 py-3">
                Title
              </th>
              <th scope="col" className="px-6 py-3">
                Price
              </th>
              <th scope="col" className="px-6 py-3">
                Discount
              </th>
              <th scope="col" className="px-6 py-3">
                After Discount
              </th>
              <th scope="col" className="px-6 py-3">
                Quantity
              </th>
              <th scope="col" className="px-6 py-3">
                Remove
              </th>
            </tr>
          </thead>

          <tbody>
            {cartProducts.length > 0 ? (
              <>
                {cartProducts.map((product: Product) => (
                  <ProductRow
                    key={product._id}
                    product={product}
                    orderItems={orderItems}
                    setOrderItems={setOrderItems}
                  />
                ))}
              </>
            ) : (
              <tr>
                <td className="w-full p-4">Your cart is empty</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Send the Order */}
      <div className="w-full max-w-75 p-5 mt-5 shadow-lg border border-slate-300">
        <div className="p-2 mb-3 flex items-center justify-between border border-slate-300 rounded">
          <span className="text-heavyGray">SubTotal</span>
          <span className="text-main text-lg font-bold">
            $
            {orderItems.reduce(
              (acc, orderItem) =>
                acc +
                (orderItem.product.price -
                  (orderItem.product.discount / 100) * orderItem.product.price) *
                  orderItem.quantity,
              0,
            )}
          </span>
        </div>

        <div className="p-2 mb-3 flex items-center justify-between border border-slate-200 rounded">
          <span className="text-heavyGray">Total</span>
          <span className="text-main text-lg font-bold">
            $
            {orderItems.reduce(
              (acc, orderItem) =>
                acc +
                (orderItem.product.price -
                  (orderItem.product.discount / 100) * orderItem.product.price) *
                  orderItem.quantity,
              0,
            )}
          </span>
        </div>

        <button
          type="button"
          disabled={createOrderLoad ? true : false}
          style={createOrderLoad ? { opacity: 0.5, cursor: "revert" } : {}}
          className="bg-main text-white text-sm rounded w-full p-2 flex items-center justify-center gap-2"
          onClick={createOrder}
        >
          <span>Send the order</span>
          {createOrderLoad ? <PuffLoader color="#fff" size={15} /> : ""}
        </button>
      </div>
    </section>
  );
};

const ProductRow = ({ product, orderItems, setOrderItems }) => {
  const productData: Product = product;
  const [removeFromCartLoad, setRemoveFromCartLoad] = useState<boolean>(false);
  const dispatch = useDispatch();
  const notify = useNotify();

  const removeProductFromCart = async (productId: number) => {
    try {
      setRemoveFromCartLoad(true);

      await cartAPI.removeFromCart(productId);

      dispatch(removeFromCart(productId));
    } catch (err) {
      if (!err?.response) {
        notify("error", "No Server Response");
      } else {
        const message = err.response?.data?.message;
        message ? notify("error", message) : notify("error", "Remove from cart fail!");
      }
    } finally {
      setRemoveFromCartLoad(false);
    }
  };

  return (
    <tr className="border-b border-slate-300 text-sm text-body bg-white font-normal">
      <th scope="row" className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap">
        <img className="w-10 h-10 rounded-md" src={productData.images[0]} alt="" />
      </th>

      <td className="px-6 py-4 whitespace-nowrap">{productData.title}</td>

      <td className="px-6 py-4 whitespace-nowrap">${productData.price}</td>

      <td className="px-6 py-4 whitespace-nowrap">%{productData.discount}</td>

      <td className="px-6 py-4 whitespace-nowrap">
        $
        {(productData.price - (productData.discount / 100) * productData.price) *
          orderItems?.find((orderItem: any) => orderItem.product._id === productData._id)
            ?.quantity || 1}
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <input
          type="number"
          min={1}
          max={productData.available}
          name="quantity"
          id="quantity"
          className="rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-3 text-black outline-none transition focus:border-main active:border-main disabled:cursor-default disabled:bg-whiter"
          value={
            orderItems?.find((orderItem: any) => orderItem.product._id === productData._id)
              ?.quantity || 1
          }
          onChange={(e) => {
            setOrderItems((prev: any[]) =>
              prev.map((orderItem: any) => {
                if (orderItem.product._id === productData._id) {
                  orderItem.quantity = +e.target.value;
                }
                return orderItem;
              }),
            );
          }}
          required
        />
      </td>

      <td className="px-6 py-4 w-32 whitespace-nowrap">
        <button
          type="button"
          title="remove from cart"
          className="text-red-500"
          onClick={() => removeProductFromCart(productData._id)}
          disabled={removeFromCartLoad ? true : false}
          style={removeFromCartLoad ? { opacity: 0.5, cursor: "revert" } : {}}
        >
          {removeFromCartLoad ? (
            <PuffLoader color="#000" size={20} />
          ) : (
            <FontAwesomeIcon icon={faTrashCan} />
          )}
        </button>
      </td>
    </tr>
  );
};

export default CartItems;
