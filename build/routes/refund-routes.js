"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/routes/refund-routes.ts
var refund_routes_exports = {};
__export(refund_routes_exports, {
  refundsRoutes: () => refundsRoutes
});
module.exports = __toCommonJS(refund_routes_exports);

// src/controllers/refunds-controller.ts
var import_zod = require("zod");

// src/database/prisma.ts
var import_client = require("@prisma/client");
var prisma = new import_client.PrismaClient({
  log: ["query"]
});

// src/utils/AppError.ts
var AppError = class {
  constructor(message, statusCode = 400) {
    this.message = message;
    this.statusCode = statusCode;
  }
  message;
  statusCode;
};

// src/controllers/refunds-controller.ts
var RefundsController = class {
  async create(request, response) {
    const bodySchema = import_zod.z.object({
      name: import_zod.z.string().trim().min(3),
      category: import_zod.z.enum(["food", "others", "services", "transport", "accommodation"]),
      amount: import_zod.z.number().positive({ message: "O valor precisa ser positivo." }),
      filename: import_zod.z.string().min(20)
    });
    const { name, category, amount, filename } = bodySchema.parse(request.body);
    if (!request.user?.id) {
      throw new AppError("Unauthorized", 401);
    }
    const refund = await prisma.refund.create({ data: { name, category, amount, filename, userId: request.user.id } });
    return response.status(201).json({ refund });
  }
  async index(request, response) {
    const querySchema = import_zod.z.object({
      name: import_zod.z.string().optional().default(""),
      page: import_zod.z.coerce.number().optional().default(1),
      perPage: import_zod.z.coerce.number().optional().default(10)
    });
    const { name, page, perPage } = querySchema.parse(request.query);
    const skip = (page - 1) * perPage;
    const refunds = await prisma.refund.findMany({
      skip,
      take: perPage,
      where: {
        user: {
          name: {
            contains: name.trim()
          }
        }
      },
      include: { user: true },
      orderBy: { createdAt: "desc" }
    });
    const totalRecords = await prisma.refund.count({
      where: {
        user: {
          name: {
            contains: name.trim()
          }
        }
      }
    });
    const totalPages = Math.ceil(totalRecords / perPage);
    return response.json({ refunds, pagination: {
      page,
      perPage,
      totalRecords,
      totalPages
    } });
  }
  async show(request, response) {
    const paramsSchema = import_zod.z.object({
      id: import_zod.z.string().uuid()
    });
    const { id } = paramsSchema.parse(request.params);
    const refund = await prisma.refund.findFirst({ where: { id }, include: { user: true } });
    return response.json(refund);
  }
};

// src/middlewares/verifyAuthorization.ts
function verifyAuthorization(role) {
  return (request, response, next) => {
    if (!request.user || !role.includes(request.user.role)) {
      throw new AppError("Unauthorized", 401);
    }
    return next();
  };
}

// src/routes/refund-routes.ts
var import_express = require("express");
var refundsRoutes = (0, import_express.Router)();
var controller = new RefundsController();
refundsRoutes.post("/", verifyAuthorization(["employee"]), controller.create);
refundsRoutes.get("/", verifyAuthorization(["manager"]), controller.index);
refundsRoutes.get("/:id", verifyAuthorization(["manager", "employee"]), controller.show);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  refundsRoutes
});
