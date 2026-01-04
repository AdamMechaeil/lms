import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "LMS API",
    description: "Documentation for LMS Server APIs",
  },
  host: "localhost:8000",
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

const outputFile = "./swagger_output.json";
const endpointsFiles = ["./src/app.ts"];

swaggerAutogen()(outputFile, endpointsFiles, doc);
