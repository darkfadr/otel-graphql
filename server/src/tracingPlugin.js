const otel = require('@opentelemetry/api');
const { getTracer } = require('./tracer');

const responsePathArray = (rp) => {
  const path = [rp.key];
  while (rp.prev) {
    rp = rp.prev;
    path.unshift(rp.key);
  }
  return path;
};

const responsePathAsString = (rp) => responsePathArray(rp).join('.');
const parentResponsePathAsString = (rp) => {
  return responsePathArray(rp).slice(0, -1).join('.');
};


const isArrayPath = (path) => typeof path.key === "number";
const buildPath = (path) => {
  let current = path;
  const segments = [];
  while (current != null) {
    if (isArrayPath(current)) {
      segments.push(`[${current.key}]`);
    } else {
      segments.push(current.key);
    }
    current = current.prev;
  }
  return segments.reverse().join(".");
}



const getRootQuery = (rp) => {
  while (rp.prev) {
    rp = rp.prev;
  }
  return rp.key;
};

const generateResolverCtx = ({ path, returnType, parentType }) => {
  const fieldResponsePath = responsePathAsString(path);
  const context = {
    name: fieldResponsePath,
    type: 'graphql_field_resolver',
    'graphql.parent_type': parentType.toString(),
    'graphql.parent_path': parentResponsePathAsString(path),
    'graphql.type': returnType.toString(),
    'graphql.field_path': fieldResponsePath,
    'graphql.field_name': '',
    'graphql.query': getRootQuery(path)
  };

  const id = path && path.key;
  if (path && path.prev && typeof path.prev.key === 'number') {
    context['graphql.field_name'] = `${path.prev.key}.${id}`;
  } else {
    context['graphql.field_name'] = id;
  }

  return context;
};

const TracingPlugin = (_futureOptions = {} ) => () => ({
  requestDidStart({ request }) {
    const tracer = otel.trace.getTracer('basic');
    const rootSpan = tracer.startSpan('graphql_query');
    rootSpan.setAttribute('query', request.query);

    return {
      executionDidStart: ({ operationName }) => {
        return {
          willResolveField: ({ info, ...args}) => {
            const attributes = generateResolverCtx(info);
            const resolverSpan = tracer.startSpan(
              attributes.name,
              { attributes, parent: rootSpan },
              otel.context.active()
            );

            // return otel.context.with(
            //   otel.setSpan(otel.context.active(), resolverSpan),
            //   () => err => {
            //     if (err) {
            //       resolverSpan.recordException(err);
            //     }
   
            //     resolverSpan.end();  
            //   }
            // );

            // return tracer.withSpan(resolverSpan, err => {
            //   if (err) {
            //     resolverSpan.recordException(err);
            //   }
 
            //   resolverSpan.end();
            // });
          
            return err => {
              if (err) {
                resolverSpan.recordException(err);
              }
 
              resolverSpan.end();
            };
          }
        };
      },
      willSendResponse: () => {
        rootSpan.end()
      }
    };
  }
});

module.exports = { TracingPlugin };