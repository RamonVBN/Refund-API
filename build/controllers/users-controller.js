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

// src/controllers/users-controller.ts
var users_controller_exports = {};
__export(users_controller_exports, {
  UsersController: () => UsersController
});
module.exports = __toCommonJS(users_controller_exports);

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

// src/controllers/users-controller.ts
var import_bcrypt = require("bcrypt");
var import_zod = require("zod");
var UsersController = class {
  async create(request, response) {
    const bodySchema = import_zod.z.object({
      name: import_zod.z.string().trim().min(3),
      email: import_zod.z.string().trim().email().toLowerCase(),
      password: import_zod.z.string().min(6),
      role: import_zod.z.enum(["employee", "manager"]).default("employee")
    });
    const { name, email, password, role } = bodySchema.parse(request.body);
    const userWithSameEmail = await prisma.user.findFirst({ where: { email } });
    if (userWithSameEmail) {
      throw new AppError("J\xE1 existe um usu\xE1rio cadastrado com esse e-mail");
    }
    const hashedPassword = await (0, import_bcrypt.hash)(password, 8);
    const new_user = await prisma.user.create({ data: { name, email, password: hashedPassword, role } });
    return response.status(201).json(new_user);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  UsersController
});
