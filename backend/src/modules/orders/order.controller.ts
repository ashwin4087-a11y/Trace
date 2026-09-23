import { asyncHandler } from "../../shared/utils/async-handler";
import * as orders from "./order.service";

export const create = asyncHandler(async (req, res) => {
  res.status(201).json({
    success: true,
    data: await orders.createOrder(req.user!.id, req.body.workshopId),
  });
});

export const getMine = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: await orders.listMine(req.user!.id),
  });
});

export const getDetails = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: await orders.getOrderDetails(req.user!.id, req.params.id, req.user!.role),
  });
});
