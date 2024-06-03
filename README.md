# @warrantdev/react-warrant-js

[![npm](https://img.shields.io/npm/v/@warrantdev/react-warrant-js)](https://www.npmjs.com/package/@warrantdev/react-warrant-js)

## Overview

The Warrant React library provides components, hooks, and helper methods for controlling access to pages and components in React using [Warrant](https://warrant.dev/). The library interacts directly with the Warrant API using short-lived session tokens that must be created server-side using your API key. Refer to [this guide](https://docs.warrant.dev/guides/creating-session-tokens) to see how to generate session tokens for your users.

## Installation

Use `npm` to install the core Warrant client module [`@warrantdev/warrant-js`](https://github.com/warrant-dev/warrant-js). This module includes methods shared across our client libraries (Vue, Angular, etc.) and additional types (for TypeScript users).

```sh
npm install @warrantdev/warrant-js
```

Use `npm` to install `@warrantdev/react-warrant-js`:

```sh
npm install @warrantdev/react-warrant-js
```

## Usage

### `WarrantProvider`

Wrap your application with `WarrantProvider`, passing it your Client Key using the `clientKey` prop. `WarrantProvider` uses [React Context](https://reactjs.org/docs/context.html) to allow you to access utility methods for performing access checks anywhere in your app.

```jsx
// App.jsx
import React from "react";
import { WarrantProvider } from "@warrantdev/react-warrant-js";

const App = () => {
  return (
    <WarrantProvider clientKey="client_test_f5dsKVeYnVSLHGje44zAygqgqXiLJBICbFzCiAg1E=">
      {/* Routes, ThemeProviders, etc. */}
    </WarrantProvider>
  );
};

export default App;
```

#### **Setting the Session Token**

In order to finish initializing the library and begin performing access checks in your app, you must provide a server-generated session token and set it using the `setSessionToken` method. Otherwise your requests will be denied by the Warrant API.

Set the session token using the `useWarrant` hook:

```jsx
// Login.jsx
import React from "react";
import { useWarrant } from "@warrantdev/react-warrant-js";

const Login = () => {
  const { setSessionToken } = useWarrant();

  const loginUser = async (event) => {
    const response = await login(email, password);

    // NOTE: This session token must be generated
    // server-side when logging users into your
    // application and then passed to the client.
    // Access check calls in this library will fail
    // if the session token is invalid or not set.
    setSessionToken(response.warrantSessionToken);

    //
    // Redirect user to logged in page
    //
  };

  return (
    <form onSubmit={loginUser}>{/* email & password inputs, etc. */}</form>
  );
};

export default Login;
```

Or using `Context.Consumer`:

```jsx
import React from "react";
import { WarrantContext } from "@warrantdev/react-warrant-js";

const Login = () => {
  const loginUser = (setSessionToken) => {
    return async (event) => {
      const response = await login(email, password);

      // NOTE: This session token must be generated
      // server-side when logging users into your
      // application and then passed to the client.
      // Access check calls in this library will fail
      // if the session token is invalid or not set.
      setSessionToken(response.warrantSessionToken);

      //
      // Redirect user to logged in page
      //
    };
  };

  return (
    <WarrantContext.Consumer>
      {({ setSessionToken }) => (
        <form onSubmit={loginUser(setSessionToken)}>
          {/* email & password inputs, etc. */}
        </form>
      )}
    </WarrantContext.Consumer>
  );
};

export default Login;
```

### `check`

`check` is a utility function that returns a `Promise` which resolves with `true` if the user for the current session token has the specified `relation` on the specified `object` and returns `false` otherwise. Use it for fine-grained conditional rendering or for specific logic within components.

Using `check` through the `useWarrant` hook:

```jsx
import React, { useEffect } from "react";
import { useWarrant } from "@warrantdev/react-warrant-js";

const MyComponent = () => {
  const { check } = useWarrant();

  useEffect(() => {
    const fetchProtectedInfo = async () => {
      // Only fetch protected info from server if
      // user can "view" the info object "protected_info".
      const userIsAuthorized = await check({
        object: {
          objectType: "info",
          objectId: "protected_info",
        },
        relation: "viewer",
      });
      if (userIsAuthorized) {
        // request protected info from server
      }
    };

    fetchProtectedInfo();
  });

  return (
    <div>{protectedInfo && <ProtectedInfo>{protectedInfo}</ProtectedInfo>}</div>
  );
};

export default MyComponent;
```

Or using the React Context API:

```jsx
import React, { useEffect } from "react";
import { WarrantContext } from "@warrantdev/react-warrant-js";

class MyComponent extends React.Component {
  async componentDidMount() {
    const { check } = this.context;

    // Only fetch protected info from server if
    // user can "view" the info object "protected_info".
    const userIsAuthorized = await check({
      object: {
        objectType: "info",
        objectId: "protected_info",
      },
      relation: "viewer",
    });
    if (userIsAuthorized) {
      await fetchProtectedInfo();
    }
  }

  async fetchProtectedInfo() {
    // request protected info from server
  }

  render() {
    return (
      <div>
        {protectedInfo && <ProtectedInfo>{protectedInfo}</ProtectedInfo>}
      </div>
    );
  }
}

MyComponent.contextType = WarrantContext;

export default MyComponent;
```

### `checkMany`

`checkMany` is a utility function that returns a `Promise` which resolves with `true` if the user for the current session token has _all of_ or _any of_ (based on a specified `op`) a set of specified `warrants` and returns `false` otherwise.

```jsx
import { CheckOp } from "@warrantdev/warrant-js";

const { checkMany } = useWarrant();

// userIsAuthorized will only be true if the user is
// a member of tenant-A AND has permission view-protected-info
const userIsAuthorized = await checkMany({
  op: CheckOp.AllOf,
  warrants: [
    {
      object: {
        objectType: "tenant",
        objectId: "tenant-A",
      },
      relation: "member",
    },
    {
      object: {
        objectType: "permission",
        objectId: "view-protected-info",
      },
      relation: "member",
    },
  ],
});
```

### `hasPermission`

`hasPermission` is a utility function that returns a `Promise` which resolves with `true` if the user for the current session token has the specified `permissionId` and returns `false` otherwise.

```jsx
import { CheckOp } from "@warrantdev/warrant-js";

const { hasPermission } = useWarrant();

// userHasPermission will only be true if the user
// has the permission view-protected-info
const userHasPermission = await hasPermission({
  permissionId: "view-protected-info",
});
```

### `hasFeature`

`hasFeature` is a utility function that returns a `Promise` which resolves with `true` if the user for the current session token has the specified `featureId` and returns `false` otherwise.

```jsx
import { CheckOp } from "@warrantdev/warrant-js";

const { hasFeature } = useWarrant();

// userHasFeature will only be true if the user
// has the feature protected-info
const userHasFeature = await hasFeature({
  featureId: "protected-info",
});
```

### `ProtectedComponent`

`ProtectedComponent` is a utility component you can wrap around markup or components that should only be accessible to users with certain privileges. It only renders the components it wraps if the user has the given warrants.

```jsx
import React from "react";
import { ProtectedComponent } from "@warrantdev/react-warrant-js";

const MyComponent = () => {
  return (
    <div>
      <MyPublicComponent />
      {/* hides MyProtectedComponent unless the user can "view" myObject with id object.id */}
      <ProtectedComponent
        warrants={[
          {
            object: {
              objectType: "myObject",
              objectId: object.id,
            },
            relation: "view",
          },
        ]}
      >
        <MyProtectedComponent />
      </ProtectedComponent>
    </div>
  );
};

export default MyComponent;
```

### `PermissionProtectedComponent`

`PermissionProtectedComponent` is a utility component you can wrap around markup or components that should only be accessible to users with certain privileges. It only renders the components it wraps if the user has the given permission.

```jsx
import React from "react";
import { PermissionProtectedComponent } from "@warrantdev/react-warrant-js";

const MyComponent = () => {
  return (
    <div>
      <MyPublicComponent />
      {/* hides MyProtectedComponent unless the user has permission "view-protected-info" */}
      <PermissionProtectedComponent permissionId="view-protected-info">
        <MyProtectedComponent />
      </PermissionProtectedComponent>
    </div>
  );
};

export default MyComponent;
```

### `FeatureProtectedComponent`

`FeatureProtectedComponent` is a utility component you can wrap around markup or components that should only be accessible to users with certain privileges. It only renders the components it wraps if the user has the given feature.

```jsx
import React from "react";
import { FeatureProtectedComponent } from "@warrantdev/react-warrant-js";

const MyComponent = () => {
  return (
    <div>
      <MyPublicComponent />
      {/* hides MyProtectedComponent unless the user has feature "protected-info" */}
      <FeatureProtectedComponent featureId="protected-info">
        <MyProtectedComponent />
      </FeatureProtectedComponent>
    </div>
  );
};

export default MyComponent;
```

### `withWarrantCheck`

Use the `withWarrantCheck` Higher Order Component (HOC) to protect components that should only be accessible to users with certain privileges.

#### **Protecting Routes**

NOTE: This example uses `react-router` but you can use any routing library.

```jsx
// App.jsx
import React from "react";
import { Router, Route, Switch } from "react-router-dom";
import { createBrowserHistory } from "history";
import { WarrantProvider, withWarrantCheck } from "@warrantdev/react-warrant-js";
import PublicPage from "./PublicPage";
import ProtectedPage from "./ProtectedPage";

const history = createBrowserHistory();

const App = () => {
    return <WarrantProvider clientKey="client_test_f5dsKVeYnVSLHGje44zAygqgqXiLJBICbFzCiAg1E=">
        <Router history={history}>
            <Switch>
                <Route path="/public_route" exact component={PublicPage}/>
                {/*
                    Only render ProtectedPage if the user
                    can "view" the route "protected_route".
                */}
                <Route path="/protected_route" exact component={withWarrantCheck(ProtectedPage, {
                    warrants: [{
                        object: {
                            objectType: "route",
                            objectId: "protected_route",
                        },
                        relation: "view",
                    }],
                    redirectTo: "/public_route",
                })}>
            </Switch>
        </Router>
    </WarrantProvider>;
};

export default App;
```

#### **Protecting Components**

```jsx
import React from "react";
import { withWarrantCheck } from "@warrantdev/react-warrant-js";

const MySecretComponent = () => {
  return <div>Super secret text</div>;
};

// Only render MySecretComponent if the user
// can "view" the component "MySecretComponent".
export default withWarrantCheck(MySecretComponent, {
  warrants: [
    {
      object: {
        objectType: "component",
        objectId: "MySecretComponent",
      },
      relation: "view",
    },
  ],
  redirectTo: "/",
});
```

### `withPermissionCheck`

Use the `withPermissionCheck` Higher Order Component (HOC) to protect components that should only be accessible to users with a certain permission.

#### **Protecting Routes**

NOTE: This example uses `react-router` but you can use any routing library.

```jsx
// App.jsx
import React from "react";
import { Router, Route, Switch } from "react-router-dom";
import { createBrowserHistory } from "history";
import { WarrantProvider, withPermissionCheck } from "@warrantdev/react-warrant-js";
import PublicPage from "./PublicPage";
import ProtectedPage from "./ProtectedPage";

const history = createBrowserHistory();

const App = () => {
    return <WarrantProvider clientKey="client_test_f5dsKVeYnVSLHGje44zAygqgqXiLJBICbFzCiAg1E=">
        <Router history={history}>
            <Switch>
                <Route path="/public_route" exact component={PublicPage}/>
                {/*
                    Only render ProtectedPage if the user
                    has the "view-protected-route" permission.
                */}
                <Route path="/protected_route" exact component={withPermissionCheck(ProtectedPage, {
                    permissionId: "view-protected-route",
                    redirectTo: "/public_route",
                })}>
            </Switch>
        </Router>
    </WarrantProvider>;
};

export default App;
```

#### **Protecting Components**

```jsx
import React from "react";
import { withPermissionCheck } from "@warrantdev/react-warrant-js";

const MySecretComponent = () => {
  return <div>Super secret text</div>;
};

// Only render MySecretComponent if the user
// has the "view-protected-route" permission.
export default withPermissionCheck(MySecretComponent, {
  permissionId: "view-protected-route",
  redirectTo: "/",
});
```

### `withFeatureCheck`

Use the `withFeatureCheck` Higher Order Component (HOC) to protect components that should only be accessible to users with a certain feature.

#### **Protecting Routes**

NOTE: This example uses `react-router` but you can use any routing library.

```jsx
// App.jsx
import React from "react";
import { Router, Route, Switch } from "react-router-dom";
import { createBrowserHistory } from "history";
import { WarrantProvider, withFeatureCheck } from "@warrantdev/react-warrant-js";
import PublicPage from "./PublicPage";
import ProtectedPage from "./ProtectedPage";

const history = createBrowserHistory();

const App = () => {
    return <WarrantProvider clientKey="client_test_f5dsKVeYnVSLHGje44zAygqgqXiLJBICbFzCiAg1E=">
        <Router history={history}>
            <Switch>
                <Route path="/public_route" exact component={PublicPage}/>
                {/*
                    Only render ProtectedPage if the user
                    has the "protected-route" feature.
                */}
                <Route path="/protected_route" exact component={withFeatureCheck(ProtectedPage, {
                    featureId: "protected-route",
                    redirectTo: "/public_route",
                })}>
            </Switch>
        </Router>
    </WarrantProvider>;
};

export default App;
```

#### **Protecting Components**

```jsx
import React from "react";
import { withFeatureCheck } from "@warrantdev/react-warrant-js";

const MySecretComponent = () => {
  return <div>Super secret text</div>;
};

// Only render MySecretComponent if the user
// has the "protected-route" feature.
export default withFeatureCheck(MySecretComponent, {
  featureId: "protected-route",
  redirectTo: "/",
});
```

## Notes

We’ve used a random Client Key in these code examples. Be sure to replace it with your
[actual Client Key](https://app.warrant.dev) to
test this code through your own Warrant account.

For more information on how to use the Warrant API, please refer to the
[Warrant API reference](https://docs.warrant.dev).

## TypeScript support

This package includes TypeScript declarations for Warrant.

Note that we may release new [minor and patch](https://semver.org/) versions of
`@warrantdev/react-warrant-js` with small but backwards-incompatible fixes to the type
declarations. These changes will not affect Warrant itself.

## Warrant Documentation

- [Warrant Docs](https://docs.warrant.dev/)
