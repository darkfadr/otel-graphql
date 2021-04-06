const { SimpleSpanProcessor } = require("@opentelemetry/tracing");
const { NodeTracerProvider } = require("@opentelemetry/node");
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { GraphQLInstrumentation } = require('@opentelemetry/instrumentation-graphql')
const { ZipkinExporter } = require("@opentelemetry/exporter-zipkin");
const opentelemetry = require("@opentelemetry/api");

let tracerInstance = null;

const getTracer = () => tracerInstance;

function initializeTracer(serviceName, zipkinUrl) {
  if (tracerInstance !== null) return;

  const exporter = new ZipkinExporter({ serviceName, url: zipkinUrl });
  const provider = new NodeTracerProvider();


  provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
  provider.register();

  registerInstrumentations({
    instrumentations: [
      new HttpInstrumentation(),
      // new GraphQLInstrumentation()
    ],
    tracerProvider: provider,
  });
  
  const gql = new GraphQLInstrumentation()
  gql.setTracerProvider(provider);
  gql.enable();


  opentelemetry.trace.setGlobalTracerProvider(provider);
  
  tracerInstance = opentelemetry.trace.getTracer("default");
  return tracerInstance;
};

module.exports = {
  initializeTracer,
  getTracer
}
