import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import request from "supertest";
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";

import app from "../src/app.js";
import { Users } from "../src/models/user.model.js";
import { Components } from "../src/models/component.model.js";
import { Requests } from "../src/models/request.model.js";
import {
  componentCategory,
  requestStatus,
  requestType,
  userRole,
} from "../src/constants/constants.js";

let mongoServer;

const createAuthToken = (userId) => jwt.sign({ id: userId.toString() }, "secret_key");

const createUser = async ({ role = userRole.USER, email }) => {
  const user = await Users.create({
    name: role === userRole.MANAGER ? "Manager" : "User",
    email,
    password: "Password@123",
    role,
  });

  return {
    user,
    token: createAuthToken(user._id),
  };
};

const createComponent = async () => {
  return Components.create({
    name: "NodeMCU ESP32",
    image: "https://cdn.example.com/components/esp32.jpg",
    description: "Microcontroller board",
    component_working: 12,
    component_not_working: 1,
    component_in_use: 3,
    remark: "Initial stock",
    category: componentCategory.MICRO_CONTROLLER,
  });
};

test.before(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { dbName: "evolve_inventory_test" });
});

test.after(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

test.beforeEach(async () => {
  await Requests.deleteMany({});
  await Components.deleteMany({});
  await Users.deleteMany({});
});

test("POST /api/v1/request/create creates a request for authenticated user", async () => {
  const { user, token } = await createUser({
    role: userRole.USER,
    email: "user-create@example.com",
  });
  const component = await createComponent();

  const payload = {
    componentId: component._id.toString(),
    remark: "Need for weekend project",
    quantity: 2,
    type: requestType.REQUEST,
  };

  const res = await request(app)
    .post("/api/v1/request/create")
    .set("Authorization", `Bearer ${token}`)
    .send(payload);

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.component, component._id.toString());
  assert.equal(res.body.data.user, user._id.toString());
  assert.equal(res.body.data.type, requestType.REQUEST);
});

test("GET /api/v1/request/user returns only logged-in user's requests", async () => {
  const { user: userA, token } = await createUser({
    role: userRole.USER,
    email: "user-a@example.com",
  });
  const { user: userB } = await createUser({
    role: userRole.USER,
    email: "user-b@example.com",
  });
  const component = await createComponent();

  await Requests.create({
    component: component._id,
    user: userA._id,
    remark: "User A request",
    quantity: 1,
    status: requestStatus.PENDING,
    type: requestType.REQUEST,
  });

  await Requests.create({
    component: component._id,
    user: userB._id,
    remark: "User B request",
    quantity: 1,
    status: requestStatus.PENDING,
    type: requestType.REQUEST,
  });

  const res = await request(app)
    .get("/api/v1/request/user")
    .set("Authorization", `Bearer ${token}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(Array.isArray(res.body.data), true);
  assert.equal(res.body.data.length, 1);
  assert.equal(res.body.data[0].user._id.toString(), userA._id.toString());
});

test("GET /api/v1/request/component/:componentId/user filters by component and logged-in user", async () => {
  const { user, token } = await createUser({
    role: userRole.USER,
    email: "user-component@example.com",
  });
  const componentA = await createComponent();
  const componentB = await Components.create({
    name: "HC-05 Bluetooth",
    image: "https://cdn.example.com/components/hc05.jpg",
    description: "Bluetooth module",
    component_working: 9,
    component_not_working: 0,
    component_in_use: 1,
    remark: "Initial",
    category: componentCategory.COMMUNICATION,
  });

  await Requests.create({
    component: componentA._id,
    user: user._id,
    remark: "Component A request",
    quantity: 2,
    status: requestStatus.PENDING,
    type: requestType.REQUEST,
  });

  await Requests.create({
    component: componentB._id,
    user: user._id,
    remark: "Component B request",
    quantity: 1,
    status: requestStatus.PENDING,
    type: requestType.REQUEST,
  });

  const res = await request(app)
    .get(`/api/v1/request/component/${componentA._id.toString()}/user`)
    .set("Authorization", `Bearer ${token}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.length, 1);
  assert.equal(res.body.data[0].component._id.toString(), componentA._id.toString());
});

test("GET /api/v1/request/component/:componentId is manager-only", async () => {
  const { token: userToken } = await createUser({
    role: userRole.USER,
    email: "not-manager@example.com",
  });
  const component = await createComponent();

  const deniedRes = await request(app)
    .get(`/api/v1/request/component/${component._id.toString()}`)
    .set("Authorization", `Bearer ${userToken}`);

  assert.equal(deniedRes.status, 403);

  const { user: manager, token: managerToken } = await createUser({
    role: userRole.MANAGER,
    email: "manager@example.com",
  });

  await Requests.create({
    component: component._id,
    user: manager._id,
    remark: "Manager-visible request",
    quantity: 1,
    status: requestStatus.PENDING,
    type: requestType.REQUEST,
  });

  const allowedRes = await request(app)
    .get(`/api/v1/request/component/${component._id.toString()}`)
    .set("Authorization", `Bearer ${managerToken}`);

  assert.equal(allowedRes.status, 200);
  assert.equal(allowedRes.body.success, true);
  assert.equal(allowedRes.body.data.length, 1);
});

test("PATCH /api/v1/request/component-request/:reqId rejects and deletes request", async () => {
  const { user } = await createUser({
    role: userRole.USER,
    email: "request-user@example.com",
  });
  const { token: managerToken } = await createUser({
    role: userRole.MANAGER,
    email: "request-manager@example.com",
  });
  const component = await createComponent();

  const reqDoc = await Requests.create({
    component: component._id,
    user: user._id,
    remark: "Please approve",
    quantity: 1,
    status: requestStatus.PENDING,
    type: requestType.REQUEST,
  });

  const res = await request(app)
    .patch(`/api/v1/request/component-request/${reqDoc._id.toString()}`)
    .set("Authorization", `Bearer ${managerToken}`)
    .send({ status: requestStatus.REJECTED, type: requestType.REQUEST });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);

  const deleted = await Requests.findById(reqDoc._id);
  assert.equal(deleted, null);
});

test("PATCH /api/v1/request/component-submit/:reqId rejects and deletes submit request", async () => {
  const { user } = await createUser({
    role: userRole.USER,
    email: "submit-user@example.com",
  });
  const { token: managerToken } = await createUser({
    role: userRole.MANAGER,
    email: "submit-manager@example.com",
  });
  const component = await createComponent();

  const reqDoc = await Requests.create({
    component: component._id,
    user: user._id,
    remark: "Returning component",
    quantity: 1,
    status: requestStatus.PENDING,
    type: requestType.SUBMIT,
  });

  const res = await request(app)
    .patch(`/api/v1/request/component-submit/${reqDoc._id.toString()}`)
    .set("Authorization", `Bearer ${managerToken}`)
    .send({
      status: requestStatus.REJECTED,
      type: requestType.SUBMIT,
      remark: "Rejected",
      component_working: 1,
      component_not_working: 0,
    });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);

  const deleted = await Requests.findById(reqDoc._id);
  assert.equal(deleted, null);
});
