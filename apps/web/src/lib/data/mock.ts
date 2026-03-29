import {
  type Color,
  createFrame,
  createScreen,
  createText,
  type Dimensions,
  type Document,
  type Node,
  type Page,
  type Size,
} from "@dashedhq/core";

// -- Zinc palette (shadcn/ui) --

const zinc950: Color = { r: 9, g: 9, b: 11, a: 1 };
const zinc500: Color = { r: 113, g: 113, b: 122, a: 1 };
const zinc400: Color = { r: 161, g: 161, b: 170, a: 1 };
const zinc200: Color = { r: 228, g: 228, b: 231, a: 1 };
const zinc100: Color = { r: 244, g: 244, b: 245, a: 1 };
const zinc50: Color = { r: 250, g: 250, b: 250, a: 1 };
const white: Color = { r: 255, g: 255, b: 255, a: 1 };
const green600: Color = { r: 22, g: 163, b: 74, a: 1 };
const amber500: Color = { r: 234, g: 179, b: 8, a: 1 };

// -- Helpers --

function t(text: string) {
  return { content: [{ text }] };
}

const fill = { type: "fill" as const };
const hug = { type: "hug" as const };
function fixed(value: number) {
  return { type: "fixed" as const, value };
}
function dims(width: Size, height: Size): Dimensions {
  return {
    width,
    height,
    minWidth: 0,
    maxWidth: "none",
    minHeight: 0,
    maxHeight: "none",
  };
}
function pad(y: number, x: number) {
  return { top: y, right: x, bottom: y, left: x };
}
function radius(v: number) {
  return { topLeft: v, topRight: v, bottomRight: v, bottomLeft: v };
}
function solid(color: Color) {
  return { type: "solid" as const, color };
}
let nextFillId = 0;
function bg(color: Color) {
  const id = `fill-${++nextFillId}`;
  return { fills: [{ id, fill: solid(color), visible: true }] };
}

const allBorders = {
  color: zinc200,
  style: "solid" as const,
  widths: { top: 1, right: 1, bottom: 1, left: 1 },
};
const bottomBorder = {
  color: zinc200,
  style: "solid" as const,
  widths: { top: 0, right: 0, bottom: 1, left: 0 },
};

// ── Page 1: Auth Flow ──────────────────────────────────────────────

function buildAuthPage(): { nodes: Record<string, Node>; children: string[] } {
  const nodes: Record<string, Node> = {};
  function add<T extends Node>(node: T) {
    nodes[node.id] = node;
    return node;
  }

  // -- Login screen --

  const loginLogo = add(
    createText({
      id: "login-logo",
      name: "Logo",
      content: [
        {
          content: [
            {
              text: "Acme",
              fills: [
                {
                  id: `fill-${++nextFillId}`,
                  fill: solid(zinc950),
                  visible: true,
                },
              ],
            },
            { text: " Inc" },
          ],
        },
      ],
      fontSize: 16,
      fontWeight: 700,
      fills: [
        { id: `fill-${++nextFillId}`, fill: solid(zinc950), visible: true },
      ],
    }),
  );

  const loginHeader = add(
    createFrame({
      id: "login-header",
      name: "Header",
      children: [loginLogo.id],
      ...bg(white),
      dimensions: dims(fill, fixed(56)),
      layout: {
        type: "stack",
        direction: "horizontal",
        gap: 0,
        align: "center",
        distribute: "start",
      },
      padding: pad(0, 24),
      borders: bottomBorder,
    }),
  );

  const loginTitle = add(
    createText({
      id: "login-title",
      name: "Title",
      content: [t("Sign in")],
      fontSize: 24,
      fontWeight: 600,
      fills: [
        { id: `fill-${++nextFillId}`, fill: solid(zinc950), visible: true },
      ],
    }),
  );

  const loginDesc = add(
    createText({
      id: "login-desc",
      name: "Description",
      content: [t("Enter your email below to sign in to your account")],
      fontSize: 14,
      fills: [
        { id: `fill-${++nextFillId}`, fill: solid(zinc500), visible: true },
      ],
    }),
  );

  const loginEmailLabel = add(
    createText({
      id: "login-email-label",
      name: "Email Label",
      content: [t("Email")],
      fontSize: 14,
      fills: [
        { id: `fill-${++nextFillId}`, fill: solid(zinc950), visible: true },
      ],
    }),
  );

  const loginEmailPlaceholder = add(
    createText({
      id: "login-email-ph",
      name: "Placeholder",
      content: [t("m@example.com")],
      fontSize: 14,
      fills: [
        { id: `fill-${++nextFillId}`, fill: solid(zinc500), visible: true },
      ],
    }),
  );

  const loginEmailInput = add(
    createFrame({
      id: "login-email",
      name: "Email Input",
      children: [loginEmailPlaceholder.id],
      ...bg(white),
      dimensions: dims(fill, fixed(40)),
      padding: pad(0, 12),
      borderRadius: radius(6),
      borders: allBorders,
      layout: {
        type: "stack",
        direction: "horizontal",
        gap: 0,
        align: "center",
        distribute: "start",
      },
    }),
  );

  const loginPassLabel = add(
    createText({
      id: "login-pass-label",
      name: "Password Label",
      content: [t("Password")],
      fontSize: 14,
      fills: [
        { id: `fill-${++nextFillId}`, fill: solid(zinc950), visible: true },
      ],
    }),
  );

  const loginPassPlaceholder = add(
    createText({
      id: "login-pass-ph",
      name: "Placeholder",
      content: [t("\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022")],
      fontSize: 14,
      fills: [
        { id: `fill-${++nextFillId}`, fill: solid(zinc500), visible: true },
      ],
    }),
  );

  const loginPassInput = add(
    createFrame({
      id: "login-pass",
      name: "Password Input",
      children: [loginPassPlaceholder.id],
      ...bg(white),
      dimensions: dims(fill, fixed(40)),
      padding: pad(0, 12),
      borderRadius: radius(6),
      borders: allBorders,
      layout: {
        type: "stack",
        direction: "horizontal",
        gap: 0,
        align: "center",
        distribute: "start",
      },
    }),
  );

  const loginBtnText = add(
    createText({
      id: "login-btn-text",
      name: "Button Text",
      content: [t("Sign In")],
      fontSize: 14,
      fontWeight: 500,
      fills: [
        { id: `fill-${++nextFillId}`, fill: solid(white), visible: true },
      ],
      textAlign: "center",
    }),
  );

  const loginBtn = add(
    createFrame({
      id: "login-btn",
      name: "Sign In Button",
      children: [loginBtnText.id],
      ...bg(zinc950),
      dimensions: dims(fill, fixed(40)),
      borderRadius: radius(6),
      layout: {
        type: "stack",
        direction: "horizontal",
        gap: 0,
        align: "center",
        distribute: "center",
      },
    }),
  );

  const loginForgot = add(
    createText({
      id: "login-forgot",
      name: "Forgot Password",
      content: [t("Forgot your password?")],
      fontSize: 12,
      fills: [
        { id: `fill-${++nextFillId}`, fill: solid(zinc500), visible: true },
      ],
      textAlign: "center",
    }),
  );

  const loginCard = add(
    createFrame({
      id: "login-card",
      name: "Card",
      children: [
        loginTitle.id,
        loginDesc.id,
        loginEmailLabel.id,
        loginEmailInput.id,
        loginPassLabel.id,
        loginPassInput.id,
        loginBtn.id,
        loginForgot.id,
      ],
      ...bg(white),
      dimensions: dims(fixed(340), hug),
      layout: {
        type: "stack",
        direction: "vertical",
        gap: 16,
        align: "start",
        distribute: "start",
      },
      padding: pad(32, 24),
      borderRadius: radius(12),
      borders: allBorders,
      effects: [
        {
          id: `effect-${++nextFillId}`,
          visible: true,
          effect: {
            type: "drop-shadow",
            shadow: {
              color: { r: 0, g: 0, b: 0, a: 0.08 },
              x: 0,
              y: 2,
              blur: 8,
              spread: 0,
            },
          },
        },
      ],
    }),
  );

  const loginBody = add(
    createFrame({
      id: "login-body",
      name: "Body",
      children: [loginCard.id],
      dimensions: dims(fill, fill),
      ...bg(zinc100),
      layout: {
        type: "stack",
        direction: "vertical",
        gap: 0,
        align: "center",
        distribute: "center",
      },
    }),
  );

  const loginRoot = add(
    createFrame({
      id: "login-root",
      name: "Login Root",
      children: [loginHeader.id, loginBody.id],
      ...bg(zinc100),
      dimensions: dims(fill, fill),
      layout: {
        type: "stack",
        direction: "vertical",
        gap: 0,
        align: "start",
        distribute: "start",
      },
    }),
  );

  add(
    createScreen({
      id: "screen-login",
      name: "Login",
      x: 100,
      y: 100,
      width: 390,
      height: 844,
      ...bg(zinc100),
      children: [loginRoot.id],
    }),
  );

  // -- Sign Up screen --

  const signupLogo = add(
    createText({
      id: "signup-logo",
      name: "Logo",
      content: [t("Acme Inc")],
      fontSize: 16,
      fontWeight: 700,
      fills: [
        { id: `fill-${++nextFillId}`, fill: solid(zinc950), visible: true },
      ],
    }),
  );

  const signupHeader = add(
    createFrame({
      id: "signup-header",
      name: "Header",
      children: [signupLogo.id],
      ...bg(white),
      dimensions: dims(fill, fixed(56)),
      layout: {
        type: "stack",
        direction: "horizontal",
        gap: 0,
        align: "center",
        distribute: "start",
      },
      padding: pad(0, 24),
      borders: bottomBorder,
    }),
  );

  const signupTitle = add(
    createText({
      id: "signup-title",
      name: "Title",
      content: [t("Create an account")],
      fontSize: 24,
      fontWeight: 600,
      fills: [
        { id: `fill-${++nextFillId}`, fill: solid(zinc950), visible: true },
      ],
    }),
  );

  const signupDesc = add(
    createText({
      id: "signup-desc",
      name: "Description",
      content: [t("Enter your information to get started")],
      fontSize: 14,
      fills: [
        { id: `fill-${++nextFillId}`, fill: solid(zinc500), visible: true },
      ],
    }),
  );

  function inputField(id: string, label: string, placeholder: string) {
    const lbl = add(
      createText({
        id: `${id}-label`,
        name: `${label} Label`,
        content: [t(label)],
        fontSize: 14,
        fills: [
          { id: `fill-${++nextFillId}`, fill: solid(zinc950), visible: true },
        ],
      }),
    );
    const ph = add(
      createText({
        id: `${id}-ph`,
        name: "Placeholder",
        content: [t(placeholder)],
        fontSize: 14,
        fills: [
          { id: `fill-${++nextFillId}`, fill: solid(zinc500), visible: true },
        ],
      }),
    );
    const input = add(
      createFrame({
        id,
        name: `${label} Input`,
        children: [ph.id],
        ...bg(white),
        dimensions: dims(fill, fixed(40)),
        padding: pad(0, 12),
        borderRadius: radius(6),
        borders: allBorders,
        layout: {
          type: "stack",
          direction: "horizontal",
          gap: 0,
          align: "center",
          distribute: "start",
        },
      }),
    );
    return { label: lbl, input };
  }

  const signupName = inputField("signup-name", "Name", "John Doe");
  const signupEmail = inputField("signup-email", "Email", "m@example.com");
  const signupPass = inputField(
    "signup-pass",
    "Password",
    "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
  );

  const signupBtnText = add(
    createText({
      id: "signup-btn-text",
      name: "Button Text",
      content: [t("Create Account")],
      fontSize: 14,
      fontWeight: 500,
      fills: [
        { id: `fill-${++nextFillId}`, fill: solid(white), visible: true },
      ],
      textAlign: "center",
    }),
  );

  const signupBtn = add(
    createFrame({
      id: "signup-btn",
      name: "Create Account Button",
      children: [signupBtnText.id],
      ...bg(zinc950),
      dimensions: dims(fill, fixed(40)),
      borderRadius: radius(6),
      layout: {
        type: "stack",
        direction: "horizontal",
        gap: 0,
        align: "center",
        distribute: "center",
      },
    }),
  );

  const signupSignin = add(
    createText({
      id: "signup-signin",
      name: "Sign In Link",
      content: [t("Already have an account? Sign in")],
      fontSize: 12,
      fills: [
        { id: `fill-${++nextFillId}`, fill: solid(zinc500), visible: true },
      ],
      textAlign: "center",
    }),
  );

  const signupCard = add(
    createFrame({
      id: "signup-card",
      name: "Card",
      children: [
        signupTitle.id,
        signupDesc.id,
        signupName.label.id,
        signupName.input.id,
        signupEmail.label.id,
        signupEmail.input.id,
        signupPass.label.id,
        signupPass.input.id,
        signupBtn.id,
        signupSignin.id,
      ],
      ...bg(white),
      dimensions: dims(fixed(340), hug),
      layout: {
        type: "stack",
        direction: "vertical",
        gap: 16,
        align: "start",
        distribute: "start",
      },
      padding: pad(32, 24),
      borderRadius: radius(12),
      borders: allBorders,
      effects: [
        {
          id: `effect-${++nextFillId}`,
          visible: true,
          effect: {
            type: "drop-shadow",
            shadow: {
              color: { r: 0, g: 0, b: 0, a: 0.08 },
              x: 0,
              y: 2,
              blur: 8,
              spread: 0,
            },
          },
        },
      ],
    }),
  );

  const signupBody = add(
    createFrame({
      id: "signup-body",
      name: "Body",
      children: [signupCard.id],
      dimensions: dims(fill, fill),
      ...bg(zinc100),
      layout: {
        type: "stack",
        direction: "vertical",
        gap: 0,
        align: "center",
        distribute: "center",
      },
    }),
  );

  const signupRoot = add(
    createFrame({
      id: "signup-root",
      name: "Signup Root",
      children: [signupHeader.id, signupBody.id],
      ...bg(zinc100),
      dimensions: dims(fill, fill),
      layout: {
        type: "stack",
        direction: "vertical",
        gap: 0,
        align: "start",
        distribute: "start",
      },
    }),
  );

  add(
    createScreen({
      id: "screen-signup",
      name: "Sign Up",
      x: 590,
      y: 100,
      width: 390,
      height: 844,
      ...bg(zinc100),
      children: [signupRoot.id],
    }),
  );

  return { nodes, children: ["screen-login", "screen-signup"] };
}

// ── Page 2: Dashboard ──────────────────────────────────────────────

function buildDashboardPage(): {
  nodes: Record<string, Node>;
  children: string[];
} {
  const nodes: Record<string, Node> = {};
  function add<T extends Node>(node: T) {
    nodes[node.id] = node;
    return node;
  }

  // -- Sidebar --

  const sidebarLogo = add(
    createText({
      id: "dash-logo",
      name: "Logo",
      content: [t("Acme Inc")],
      fontSize: 16,
      fontWeight: 700,
      fills: [
        { id: `fill-${++nextFillId}`, fill: solid(white), visible: true },
      ],
    }),
  );

  function navItem(id: string, label: string, active: boolean) {
    const text = add(
      createText({
        id: `${id}-text`,
        name: "Text",
        content: [t(label)],
        fontSize: 14,
        fontWeight: active ? 500 : 400,
        fills: [
          {
            id: `fill-${++nextFillId}`,
            fill: solid(active ? zinc50 : zinc400),
            visible: true,
          },
        ],
      }),
    );
    return add(
      createFrame({
        id,
        name: `Nav - ${label}`,
        children: [text.id],
        ...(active ? { ...bg({ r: 39, g: 39, b: 42, a: 1 }) } : {}),
        dimensions: dims(fill, fixed(36)),
        padding: pad(0, 12),
        borderRadius: radius(6),
        layout: {
          type: "stack",
          direction: "horizontal",
          gap: 0,
          align: "center",
          distribute: "start",
        },
      }),
    );
  }

  const nav1 = navItem("dash-nav-1", "Dashboard", true);
  const nav2 = navItem("dash-nav-2", "Customers", false);
  const nav3 = navItem("dash-nav-3", "Products", false);
  const nav4 = navItem("dash-nav-4", "Settings", false);

  const navGroup = add(
    createFrame({
      id: "dash-nav",
      name: "Navigation",
      children: [nav1.id, nav2.id, nav3.id, nav4.id],
      dimensions: dims(fill, hug),
      layout: {
        type: "stack",
        direction: "vertical",
        gap: 4,
        align: "start",
        distribute: "start",
      },
    }),
  );

  const sidebar = add(
    createFrame({
      id: "dash-sidebar",
      name: "Sidebar",
      children: [sidebarLogo.id, navGroup.id],
      ...bg(zinc950),
      dimensions: dims(fixed(240), fill),
      layout: {
        type: "stack",
        direction: "vertical",
        gap: 24,
        align: "start",
        distribute: "start",
      },
      padding: pad(20, 16),
    }),
  );

  // -- Top bar --

  const topbarTitle = add(
    createText({
      id: "dash-topbar-title",
      name: "Title",
      content: [t("Dashboard")],
      fontSize: 16,
      fontWeight: 600,
      fills: [
        { id: `fill-${++nextFillId}`, fill: solid(zinc950), visible: true },
      ],
    }),
  );

  const topbar = add(
    createFrame({
      id: "dash-topbar",
      name: "Top Bar",
      children: [topbarTitle.id],
      ...bg(white),
      dimensions: dims(fill, fixed(56)),
      padding: pad(0, 24),
      borders: bottomBorder,
      layout: {
        type: "stack",
        direction: "horizontal",
        gap: 0,
        align: "center",
        distribute: "start",
      },
    }),
  );

  // -- Stats --

  function statCard(id: string, label: string, value: string) {
    const lbl = add(
      createText({
        id: `${id}-label`,
        name: "Label",
        content: [t(label)],
        fontSize: 12,
        fills: [
          { id: `fill-${++nextFillId}`, fill: solid(zinc500), visible: true },
        ],
      }),
    );
    const val = add(
      createText({
        id: `${id}-value`,
        name: "Value",
        content: [t(value)],
        fontSize: 28,
        fontWeight: 600,
        fills: [
          { id: `fill-${++nextFillId}`, fill: solid(zinc950), visible: true },
        ],
        letterSpacing: -0.5,
      }),
    );
    return add(
      createFrame({
        id,
        name: label,
        children: [lbl.id, val.id],
        ...bg(white),
        dimensions: dims(fill, hug),
        layout: {
          type: "stack",
          direction: "vertical",
          gap: 4,
          align: "start",
          distribute: "start",
        },
        padding: pad(20, 20),
        borderRadius: radius(8),
        borders: allBorders,
      }),
    );
  }

  const stat1 = statCard("dash-stat-1", "Total Revenue", "$45,231");
  const stat2 = statCard("dash-stat-2", "Customers", "+2,350");
  const stat3 = statCard("dash-stat-3", "Active Now", "+573");

  const statsRow = add(
    createFrame({
      id: "dash-stats",
      name: "Stats Row",
      children: [stat1.id, stat2.id, stat3.id],
      dimensions: dims(fill, hug),
      layout: {
        type: "stack",
        direction: "horizontal",
        gap: 16,
        align: "start",
        distribute: "start",
      },
    }),
  );

  // -- Table --

  function tableRow(
    id: string,
    name: string,
    status: string,
    statusColor: Color,
    amount: string,
    hasBorder: boolean,
  ) {
    const nameText = add(
      createText({
        id: `${id}-name`,
        name: "Name",
        content: [t(name)],
        fontSize: 14,
        fills: [
          { id: `fill-${++nextFillId}`, fill: solid(zinc950), visible: true },
        ],
      }),
    );
    const statusText = add(
      createText({
        id: `${id}-status`,
        name: "Status",
        content: [t(status)],
        fontSize: 12,
        fills: [
          {
            id: `fill-${++nextFillId}`,
            fill: solid(statusColor),
            visible: true,
          },
        ],
      }),
    );
    const spacer = add(
      createFrame({
        id: `${id}-spacer`,
        name: "Spacer",
        dimensions: dims(fill, hug),
        children: [statusText.id],
      }),
    );
    const amountText = add(
      createText({
        id: `${id}-amount`,
        name: "Amount",
        content: [t(amount)],
        fontSize: 14,
        fills: [
          { id: `fill-${++nextFillId}`, fill: solid(zinc950), visible: true },
        ],
        textAlign: "end",
      }),
    );
    return add(
      createFrame({
        id,
        name,
        children: [nameText.id, spacer.id, amountText.id],
        dimensions: dims(fill, fixed(48)),
        padding: pad(0, 20),
        ...(hasBorder ? { borders: bottomBorder } : {}),
        layout: {
          type: "stack",
          direction: "horizontal",
          gap: 0,
          align: "center",
          distribute: "start",
        },
      }),
    );
  }

  const tableTitle = add(
    createText({
      id: "dash-table-title",
      name: "Title",
      content: [t("Recent Orders")],
      fontSize: 16,
      fontWeight: 600,
      fills: [
        { id: `fill-${++nextFillId}`, fill: solid(zinc950), visible: true },
      ],
    }),
  );

  const tableHeader = add(
    createFrame({
      id: "dash-table-header",
      name: "Table Header",
      children: [tableTitle.id],
      dimensions: dims(fill, hug),
      padding: pad(16, 20),
      borders: bottomBorder,
    }),
  );

  // Column headers
  const thCustomer = add(
    createText({
      id: "dash-th-customer",
      name: "Customer",
      content: [t("Customer")],
      fontSize: 12,
      fills: [
        { id: `fill-${++nextFillId}`, fill: solid(zinc500), visible: true },
      ],
    }),
  );
  const thStatusText = add(
    createText({
      id: "dash-th-status-text",
      name: "Status",
      content: [t("Status")],
      fontSize: 12,
      fills: [
        { id: `fill-${++nextFillId}`, fill: solid(zinc500), visible: true },
      ],
    }),
  );
  const thStatusSpacer = add(
    createFrame({
      id: "dash-th-status",
      name: "Spacer",
      dimensions: dims(fill, hug),
      children: [thStatusText.id],
    }),
  );
  const thAmount = add(
    createText({
      id: "dash-th-amount",
      name: "Amount",
      content: [t("Amount")],
      fontSize: 12,
      fills: [
        { id: `fill-${++nextFillId}`, fill: solid(zinc500), visible: true },
      ],
      textAlign: "end",
    }),
  );

  const colHeaders = add(
    createFrame({
      id: "dash-col-headers",
      name: "Column Headers",
      children: [thCustomer.id, thStatusSpacer.id, thAmount.id],
      ...bg(zinc100),
      dimensions: dims(fill, fixed(40)),
      padding: pad(0, 20),
      layout: {
        type: "stack",
        direction: "horizontal",
        gap: 0,
        align: "center",
        distribute: "start",
      },
    }),
  );

  const row1 = tableRow(
    "dash-r1",
    "Olivia Martin",
    "Completed",
    green600,
    "$1,999.00",
    true,
  );
  const row2 = tableRow(
    "dash-r2",
    "Jackson Lee",
    "Processing",
    amber500,
    "$39.00",
    true,
  );
  const row3 = tableRow(
    "dash-r3",
    "Isabella Nguyen",
    "Completed",
    green600,
    "$299.00",
    false,
  );

  const tableCard = add(
    createFrame({
      id: "dash-table",
      name: "Recent Orders",
      children: [tableHeader.id, colHeaders.id, row1.id, row2.id, row3.id],
      ...bg(white),
      dimensions: dims(fill, hug),
      layout: {
        type: "stack",
        direction: "vertical",
        gap: 0,
        align: "start",
        distribute: "start",
      },
      borderRadius: radius(8),
      borders: allBorders,
    }),
  );

  // -- Content area --

  const content = add(
    createFrame({
      id: "dash-content",
      name: "Content",
      children: [statsRow.id, tableCard.id],
      dimensions: dims(fill, fill),
      layout: {
        type: "stack",
        direction: "vertical",
        gap: 24,
        align: "start",
        distribute: "start",
      },
      padding: pad(24, 24),
    }),
  );

  const main = add(
    createFrame({
      id: "dash-main",
      name: "Main Content",
      children: [topbar.id, content.id],
      ...bg(white),
      dimensions: dims(fill, fill),
      layout: {
        type: "stack",
        direction: "vertical",
        gap: 0,
        align: "start",
        distribute: "start",
      },
    }),
  );

  const root = add(
    createFrame({
      id: "dash-root",
      name: "Dashboard Root",
      children: [sidebar.id, main.id],
      dimensions: dims(fill, fill),
      layout: {
        type: "stack",
        direction: "horizontal",
        gap: 0,
        align: "start",
        distribute: "start",
      },
    }),
  );

  add(
    createScreen({
      id: "screen-dash",
      name: "Dashboard",
      x: 100,
      y: 100,
      width: 1280,
      height: 800,
      ...bg(zinc100),
      children: [root.id],
    }),
  );

  return { nodes, children: ["screen-dash"] };
}

// ── Data store ─────────────────────────────────────────────────────

const auth = buildAuthPage();
const dashboard = buildDashboardPage();

const pages: Record<string, Record<string, Page>> = {
  "doc-1": {
    "page-auth": {
      id: "page-auth",
      name: "Auth Flow",
      nodes: auth.nodes,
      children: auth.children,
    },
    "page-dashboard": {
      id: "page-dashboard",
      name: "Dashboard",
      nodes: dashboard.nodes,
      children: dashboard.children,
    },
  },
};

const documents: Record<string, Document> = {
  "doc-1": {
    id: "doc-1",
    name: "Acme App",
    pages: [
      { id: "page-auth", name: "Auth Flow" },
      { id: "page-dashboard", name: "Dashboard" },
    ],
  },
};

// ── Public API ─────────────────────────────────────────────────────

export function getDocument(docId: string): Document {
  const doc = documents[docId];
  if (!doc) {
    throw new Error(`Document "${docId}" not found`);
  }
  return doc;
}

export function getPage(docId: string, pageId: string): Page | undefined {
  return pages[docId]?.[pageId];
}
