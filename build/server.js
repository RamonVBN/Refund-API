"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/app.ts
var import_express6 = __toESM(require("express"));
var import_cors = __toESM(require("cors"));
var import_express_async_errors = require("express-async-errors");

// src/utils/AppError.ts
var AppError = class {
  constructor(message, statusCode = 400) {
    this.message = message;
    this.statusCode = statusCode;
  }
  message;
  statusCode;
};

// src/middlewares/erro-handling.ts
var import_zod = require("zod");
var errorHandling = (error, request, response, next) => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({ message: error.message });
    return;
  }
  if (error instanceof import_zod.ZodError) {
    response.status(400).json({ message: "Validation error", issues: error.format() });
    return;
  }
  response.status(500).json({ message: error.message });
  return;
};

// src/routes/index.ts
var import_express5 = require("express");

// src/database/prisma.ts
var import_client = require("@prisma/client");
var prisma = new import_client.PrismaClient({
  log: ["query"]
});

// src/controllers/users-controller.ts
var import_bcrypt = require("bcrypt");
var import_zod2 = require("zod");
var UsersController = class {
  async create(request, response) {
    const bodySchema = import_zod2.z.object({
      name: import_zod2.z.string().trim().min(3),
      email: import_zod2.z.string().trim().email().toLowerCase(),
      password: import_zod2.z.string().min(6),
      role: import_zod2.z.enum(["employee", "manager"]).default("employee")
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

// src/routes/users-routes.ts
var import_express = require("express");
var usersRoutes = (0, import_express.Router)();
var controller = new UsersController();
usersRoutes.post("/", controller.create);

// src/controllers/sessions-controller.ts
var import_bcrypt2 = require("bcrypt");
var import_zod3 = require("zod");
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
    const bodySchema = import_zod3.z.object({
      email: import_zod3.z.string().email(),
      password: import_zod3.z.string().min(6)
    });
    const { email, password } = bodySchema.parse(request.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError("Email ou senha inv\xE1lido.");
    }
    const { password: hashedPassword } = user;
    const passwordMatched = await (0, import_bcrypt2.compare)(password, hashedPassword);
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

// src/routes/sessions-routes.ts
var import_express2 = require("express");
var sessionRoutes = (0, import_express2.Router)();
var controller2 = new SessionsController();
sessionRoutes.use("/", controller2.create);

// src/controllers/refunds-controller.ts
var import_zod4 = require("zod");
var RefundsController = class {
  async create(request, response) {
    const bodySchema = import_zod4.z.object({
      name: import_zod4.z.string().trim().min(3),
      category: import_zod4.z.enum(["food", "others", "services", "transport", "accommodation"]),
      amount: import_zod4.z.number().positive({ message: "O valor precisa ser positivo." }),
      filename: import_zod4.z.string().min(20)
    });
    const { name, category, amount, filename } = bodySchema.parse(request.body);
    if (!request.user?.id) {
      throw new AppError("Unauthorized", 401);
    }
    const refund = await prisma.refund.create({ data: { name, category, amount, filename, userId: request.user.id } });
    return response.status(201).json({ refund });
  }
  async index(request, response) {
    const querySchema = import_zod4.z.object({
      name: import_zod4.z.string().optional().default(""),
      page: import_zod4.z.coerce.number().optional().default(1),
      perPage: import_zod4.z.coerce.number().optional().default(10)
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
    const paramsSchema = import_zod4.z.object({
      id: import_zod4.z.string().uuid()
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
var import_express3 = require("express");
var refundsRoutes = (0, import_express3.Router)();
var controller3 = new RefundsController();
refundsRoutes.post("/", verifyAuthorization(["employee"]), controller3.create);
refundsRoutes.get("/", verifyAuthorization(["manager"]), controller3.index);
refundsRoutes.get("/:id", verifyAuthorization(["manager", "employee"]), controller3.show);

// src/middlewares/authenticate.ts
var import_jsonwebtoken2 = require("jsonwebtoken");
function authenticate(request, response, next) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new AppError("Token n\xE3o informado.", 401);
    }
    const [, token] = authHeader?.split(" ");
    const { role, sub: user_id } = (0, import_jsonwebtoken2.verify)(token, authConfig.jwt.secret);
    request.user = {
      id: user_id,
      role
    };
    return next();
  } catch (error) {
    throw new AppError("Invalid JWT token", 401);
  }
}

// src/routes/uploads-routes.ts
var import_express4 = require("express");

// src/controllers/uploads-controller.ts
var import_zod5 = require("zod");

// src/configs/upload.ts
var import_multer = __toESM(require("multer"));
var import_node_path = __toESM(require("path"));
var import_node_crypto = __toESM(require("crypto"));
var TMP_FOLDER = import_node_path.default.resolve(__dirname, "..", "..", "tmp");
var UPLOADS_FOLDER = import_node_path.default.resolve(TMP_FOLDER, "uploads");
var MAX_SIZE = 3;
var MAX_FILE_SIZE = 1024 * 1024 * MAX_SIZE;
var ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];
var MULTER = {
  storage: import_multer.default.diskStorage({
    destination: TMP_FOLDER,
    filename(request, file, callback) {
      const fileHash = import_node_crypto.default.randomBytes(10).toString("hex");
      const fileName = `${fileHash}-${file.originalname}`;
      return callback(null, fileName);
    }
  })
};
var upload_default = {
  TMP_FOLDER,
  UPLOADS_FOLDER,
  MULTER,
  MAX_FILE_SIZE,
  MAX_SIZE,
  ACCEPTED_IMAGE_TYPES
};

// src/providers/disk-storage.ts
var import_node_fs = __toESM(require("fs"));
var import_node_path2 = __toESM(require("path"));
var DiskStorage = class {
  async saveFile(file) {
    const tmpPath = import_node_path2.default.resolve(upload_default.TMP_FOLDER, file);
    const destPath = import_node_path2.default.resolve(upload_default.UPLOADS_FOLDER, file);
    try {
      await import_node_fs.default.promises.access(tmpPath);
    } catch (error) {
      console.log(error);
      throw new Error("Arquivo n\xE3o encontrado " + tmpPath);
    }
    await import_node_fs.default.promises.mkdir(upload_default.UPLOADS_FOLDER, { recursive: true });
    await import_node_fs.default.promises.rename(tmpPath, destPath);
    return file;
  }
  async deleteFile(file, type) {
    const pathFile = type === "tmp" ? upload_default.TMP_FOLDER : upload_default.UPLOADS_FOLDER;
    const filePath = import_node_path2.default.resolve(pathFile, file);
    try {
      await import_node_fs.default.promises.stat(filePath);
    } catch (error) {
      return;
    }
    await import_node_fs.default.promises.unlink(filePath);
  }
};

// src/controllers/uploads-controller.ts
var UploadsController = class {
  async create(request, response) {
    const diskStorage = new DiskStorage();
    try {
      const fileSchema = import_zod5.z.object({
        filename: import_zod5.z.string().min(1, "Arquivo \xE9 obrigat\xF3rio"),
        mimetype: import_zod5.z.string().refine((type) => upload_default.ACCEPTED_IMAGE_TYPES.includes(type), "Formato de arquivo inv\xE1lido. Formatos permitidos: " + upload_default.ACCEPTED_IMAGE_TYPES),
        size: import_zod5.z.number().positive().refine((size) => size <= upload_default.MAX_FILE_SIZE, "Arquivo excede o tamanho m\xE1ximo de " + upload_default.MAX_SIZE)
      }).passthrough();
      const file = fileSchema.parse(request.file);
      const filename = await diskStorage.saveFile(file.filename);
      response.json({ filename });
    } catch (error) {
      if (error instanceof import_zod5.ZodError) {
        if (request.file) {
          await diskStorage.deleteFile(request.file?.filename, "tmp");
        }
        throw new AppError(error.issues[0].message);
      }
      throw error;
    }
  }
};

// src/routes/uploads-routes.ts
var import_multer2 = __toESM(require("multer"));
var uploadsRoutes = (0, import_express4.Router)();
var controller4 = new UploadsController();
var upload = (0, import_multer2.default)(upload_default.MULTER);
uploadsRoutes.use(verifyAuthorization(["employee"]));
uploadsRoutes.post("/", upload.single("file"), controller4.create);

// src/routes/index.ts
var routes = (0, import_express5.Router)();
routes.use("/users", usersRoutes);
routes.use("/sessions", sessionRoutes);
routes.use(authenticate);
routes.use("/refunds", refundsRoutes);
routes.use("/uploads", uploadsRoutes);

// src/app.ts
var app = (0, import_express6.default)();
app.use((0, import_cors.default)());
app.use(import_express6.default.json());
app.use("/uploads", import_express6.default.static(upload_default.UPLOADS_FOLDER));
app.use(routes);
app.use(errorHandling);

// src/server.ts
var PORT = 3333;
app.listen(PORT, () => console.log(`Server is running out the door ${PORT}`));
