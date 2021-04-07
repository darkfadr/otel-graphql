const { SimpleSpanProcessor } = require("@opentelemetry/tracing");
const { NodeTracerProvider } = require("@opentelemetry/node");
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { ZipkinExporter } = require("@opentelemetry/exporter-zipkin");
const opentelemetry = require("@opentelemetry/api");

let tracerInstance = null;

function initializeTracer(serviceName, zipkinUrl) {
  if (tracerInstance !== null) return;

  const exporter = new ZipkinExporter({ serviceName, url: zipkinUrl });
  const provider = new NodeTracerProvider();


  provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
  provider.register();

  registerInstrumentations({
    instrumentations: [
      new HttpInstrumentation()
    ],
    tracerProvider: provider,
  });

  opentelemetry.trace.setGlobalTracerProvider(provider);
  
  tracerInstance = opentelemetry.trace.getTracer("default");
  return tracerInstance;
};

function getTracer() {
  if (tracerInstance == null) {
    throw new Error("Tracer is not initialized");
  }

  return tracerInstance;
}

module.exports = {
  initializeTracer,
  getTracer
}
