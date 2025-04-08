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

// src/controllers/sessions-controller.ts
var sessions_controller_exports = {};
__export(sessions_controller_exports, {
  SessionsController: () => SessionsController
});
module.exports = __toCommonJS(sessions_controller_exports);

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

// src/controllers/sessions-controller.ts
var import_bcrypt = require("bcrypt");
var import_zod = require("zod");
var import_jsonwebtoken = require("jsonwebtoken");

// src/configs/auth.ts
var authConfig = {
  jwt: {
    secret: "ramon",
    expiresIn: "1d"
  }
};

// src/controllers/sessions-controller.ts
var SessionsController = class {
  async create(request, response) {
    const bodySchema = import_zod.z.object({
      email: import_zod.z.string().email(),
      password: import_zod.z.string().min(6)
    });
    const { email, password } = bodySchema.parse(request.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError("Email ou senha inv\xE1lido.");
    }
    const { password: hashedPassword } = user;
    const passwordMatched = await (0, import_bcrypt.compare)(password, hashedPassword);
    if (!passwordMatched) {
      throw new AppError("Email ou senha inv\xE1lido.");
    }
    const token = (0, import_jsonwebtoken.sign)(
      { role: user.role },
      authConfig.jwt.secret,
      {
        subject: user.id,
        expiresIn: authConfig.jwt.expiresIn
      }
    );
    const { password: _, ...userWithoutPassword } = user;
    return response.status(201).json({ token, userWithoutPassword });
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SessionsController
});
