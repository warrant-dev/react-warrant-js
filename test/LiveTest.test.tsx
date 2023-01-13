import { describe, afterAll, beforeAll, afterEach, test, expect } from "@jest/globals";
import React, { useEffect } from "react";
import { render, cleanup, waitFor, screen } from "@testing-library/react";

// Simulate browser environment
global.XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

import { WarrantClient, Role, Permission, PricingTier, Feature, User } from "@warrantdev/warrant-node";
import { ProtectedComponent, PermissionProtectedComponent, FeatureProtectedComponent, useWarrant, WarrantProvider } from "../dist";

interface TestAppProps {
    children: any;
    clientKey: string;
    sessionToken: string;
}

const TestApp: React.FunctionComponent<TestAppProps> = ({ children, clientKey, sessionToken }) => {
    return <WarrantProvider clientKey={clientKey}>
        <TestPage sessionToken={sessionToken}>
            {children}
        </TestPage>
    </WarrantProvider>;
};

interface TestPageProps {
    children: any;
    sessionToken: string;
}

const TestPage: React.FunctionComponent<TestPageProps> = ({ children, sessionToken }) => {
    const { setSessionToken } = useWarrant();

    useEffect(() => {
        setSessionToken(sessionToken);
    }, []);

    return children;
};

// Remove .skip below and add your API_KEY and CLIENT_KEY to run the tests.
describe.skip("Live Test", () => {
    const apiKey = "API_KEY";
    const clientKey = "CLIENT_KEY";

    let role: Role;
    let permission: Permission;
    let feature: Feature;
    let pricingTier: PricingTier;
    let user: User;
    let sessionToken: string;

    beforeAll(async () => {
        const warrant = new WarrantClient({ apiKey });
        role = await Role.create({ roleId: "test-role" });
        permission = await warrant.Permission.create({ permissionId: "test-permission" });
        feature = await warrant.Feature.create({ featureId: "test-feature" });
        pricingTier = await warrant.PricingTier.create({ pricingTierId: "test-pricing-tier" });
        user = await warrant.User.create({ userId: "test-user" });
        sessionToken = await warrant.Session.createAuthorizationSession({ userId: user.userId });

        await role.assignPermission(permission.permissionId);
        await pricingTier.assignFeature(feature.featureId);
        await user.assignRole(role.roleId);
        await user.assignPricingTier(pricingTier.pricingTierId);
    });

    afterAll(async () => {
        const warrant = new WarrantClient({ apiKey });

        await user.removePricingTier(pricingTier.pricingTierId);
        await user.removeRole(role.roleId);
        await pricingTier.removeFeature(feature.featureId);
        await role.removePermission(permission.permissionId);

        await warrant.User.delete(user.userId);
        await warrant.PricingTier.delete(pricingTier.pricingTierId);
        await warrant.Feature.delete(feature.featureId);
        await warrant.Permission.delete(permission.permissionId);
        await warrant.Role.delete(role.roleId);
    });

    afterEach(cleanup);

    test ("<WarrantProvider />", async () => {
        render(<TestApp clientKey={clientKey} sessionToken={sessionToken}>
            <ProtectedComponent warrants={[{
                object: role,
                relation: "member"
            }]}>
                <div data-testid="show">Show</div>
            </ProtectedComponent>

            <ProtectedComponent warrants={[{
                object: role,
                relation: "owner"
            }]}>
                <div data-testid="do-not-show">Do Not Show</div>
            </ProtectedComponent>

            <PermissionProtectedComponent permissionId="test-permission">
                <div data-testid="permission-show">Show</div>
            </PermissionProtectedComponent>

            <PermissionProtectedComponent permissionId="another-permission">
                <div data-testid="permission-do-not-show">Show</div>
            </PermissionProtectedComponent>

            <FeatureProtectedComponent featureId="test-feature">
                <div data-testid="feature-show">Show</div>
            </FeatureProtectedComponent>

            <FeatureProtectedComponent featureId="another-feature">
                <div data-testid="feature-do-not-show">Show</div>
            </FeatureProtectedComponent>
        </TestApp>);

        await waitFor(() => {
            expect(screen.getByTestId("show")).not.toBeNull();
            expect(screen.getByTestId("permission-show")).not.toBeNull();
            expect(screen.getByTestId("feature-show")).not.toBeNull();
        });

        expect(screen.queryByTestId("do-not-show")).toBeNull();
        expect(screen.queryByTestId("permission-do-not-show")).toBeNull();
        expect(screen.queryByTestId("feature-do-not-show")).toBeNull();
    });
});
