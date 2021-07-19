# @warrantdev/react-warrant-js

## Overview
The Warrant React library provides components, hooks, and helper methods for controlling access to pages and components in React using [Warrant](https://warrant.dev/). The library interacts directly with the Warrant API using a short-lived session token that must be created server-side using your API key. Refer to [this guide]() to see how to generate session tokens for your users.

## Installation

Use `npm` to install the module:

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
    return <WarrantProvider clientKey="client_test_f5dsKVeYnVSLHGje44zAygqgqXiLJBICbFzCiAg1E=">
        {/* Routes, ThemeProviders, etc. */}
    </WarrantProvider>;
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

    return <form onSubmit={loginUser}>
        {/* email & password inputs, etc. */}
    </form>;
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

    return <WarrantContext.Consumer>
        {({ setSessionToken }) => (
            <form onSubmit={loginUser(setSessionToken)}>
                {/* email & password inputs, etc. */}
            </form>
        )}
    </WarrantContext.Consumer>;
};

export default Login;
```

### `hasWarrant(objectType, objectId, relation)`
`hasWarrant` is a utility function that returns a `Promise` which resolves with `true` if the user for the current session token has the warrant with the specified `objectType`, `objectId`, and `relation` and returns `false` otherwise. Use it for fine-grained conditional rendering or for specific logic within components.

Using `hasWarrant` through the `useWarrant` hook:
```jsx
import React, { useEffect } from "react";
import { useWarrant } from "@warrantdev/react-warrant-js";

const MyComponent = () => {
    const { hasWarrant } = useWarrant();

    useEffect(() => {
        const fetchProtectedInfo = async () => {
            // Only fetch protected info from server if
            // user can "view" the info object "protected_info".
            if (await hasWarrant("info", "protected_info", "view")) {
                // request protected info from server
            }
        };

        fetchProtectedInfo();
    });

    return <div>
        {protectedInfo &&
            <ProtectedInfo>{protectedInfo}</ProtectedInfo>
        }
    </div>;
};

export default MyComponent;
```
Or using the React Context API:
```jsx
import React, { useEffect } from "react";
import { WarrantContext } from "@warrantdev/react-warrant-js";

class MyComponent extends React.Component {
    async componentDidMount() {
        const { hasWarrant } = this.context;

        // Only fetch protected info from server if
            // user can "view" the info object "protected_info".
        if (await hasWarrant("info", "protected_info", "view")) {
            await fetchProtectedInfo();
        }
    };

    async fetchProtectedInfo() {
        // request protected info from server
    };

    render() {
        return <div>
            {protectedInfo &&
                <ProtectedInfo>{protectedInfo}</ProtectedInfo>
            }
        </div>;
    }
};

MyComponent.contextType = WarrantContext;

export default MyComponent;
```

### `ProtectedRoute`
`ProtectedRoute` is a utility component you can use in place of the standard [React Router](https://reactrouter.com/) `Route` component to easily protect your React routes behind a warrant.
```jsx
import React from "react";
import { Router, Route, Switch } from "react-router-dom";
import { createBrowserHistory } from "history";
import { WarrantProvider, ProtectedRoute, WARRANT_IGNORE_ID } from "@warrantdev/react-warrant-js";
import PublicPage from "./PublicPage";
import ProtectedPage from "./ProtectedPage";

const history = createBrowserHistory();

const App = () => {
    return <WarrantProvider clientKey="client_test_f5dsKVeYnVSLHGje44zAygqgqXiLJBICbFzCiAg1E=">
        <Router history={history}>
            <Switch>
                <Route path="/public_route" exact component={PublicPage}/>
                <ProtectedRoute
                    path="/protected_route/:id"
                    key="/protected_route/:id"
                    exact
                    component={ProtectedPage}
                    options={{
                        objectType: "myObject",
                        objectIdParam: "id",
                        relation: "view",
                        redirectTo: "/public_route",
                    }}
                />
            </Switch>
        </Router>
    </WarrantProvider>;
};

export default App;
```

### `ProtectedComponent`
`ProtectedComponent` is a utility component you can wrap around markup or components that should only be accessible to users with certain privileges. It only renders the components it wraps if the user has the given warrant.
```jsx
import React from "react";
import { ProtectedComponent } from "@warrantdev/react-warrant-js";

const MyComponent = () => {
    return <div>
        <MyPublicComponent/>
        {/* hides MyProtectedComponent unless the user can "view" myObject with id object.id */}
        <ProtectedComponent
            objectType="myObject"
            objectId={object.id}
            relation="view"
        >
            <MyProtectedComponent/>
        </ProtectedComponent>
    </div>;
};

export default MyComponent;
```

**NOTE:** To ignore the `objectId` when using any of the provided components, you can pass the constant `WARRANT_IGNORE_ID`. You must have a corresponding warrant that grants access to **ANY** user on the given `objectType` for this check to succeed.
```jsx
import React from "react";
import { ProtectedComponent, WARRANT_IGNORE_ID } from "@warrantdev/react-warrant-js";

const MyComponent = () => {
    return <div>
        <MyPublicComponent/>
        {/* Only shows MyProtectedComponent if the user can "view" ANY myObject */}
        <ProtectedComponent
            objectType="myObject"
            objectId={WARRANT_IGNORE_ID}
            relation="view"
        >
            <MyProtectedComponent/>
        </ProtectedComponent>
    </div>;
};

export default MyComponent;
```

### `withWarrant`
Use the `withWarrant` Higher Order Component (HOC) to protect components that should only be accessible to users with certain privileges.

#### **Protecting Routes**
NOTE: This example uses `react-router` but you can use any routing library.
```jsx
// App.jsx
import React from "react";
import { Router, Route, Switch } from "react-router-dom";
import { createBrowserHistory } from "history";
import { WarrantProvider, withWarrant } from "@warrantdev/react-warrant-js";
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
                <Route path="/protected_route" exact component={useWarrant(ProtectedPage, {
                    objectType: "route",
                    objectId: "protected_route",
                    relation: "view",
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
import { withWarrant } from "@warrantdev/react-warrant-js";

const MySecretComponent = () => {
    return <div>Super secret text</div>;
};

// Only render MySecretComponent if the user
// can "view" the component "MySecretComponent".
export default withWarrant(MySecretComponent, {
    objectType: "component",
    objectId: "MySecretComponent",
    relation: "view",
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
