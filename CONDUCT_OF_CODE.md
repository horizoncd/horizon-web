# code style

## 基本规则

- 每个文件只包含一个 React 组件
  - 一个文件中可以包含多个不含状态的组件
  - 组织文件的原则是可以到达“最大复用”
- 总是使用 TSX 语法
- 在使用一个普通函数返回 ReactNode 和将逻辑包装成一个 React 组件之间，总是应该选择后者

## Props

- props 使用小驼峰

```jsx
// bad
<Foo
  UserName="hello"
  phone_number={12345678}
/> // good
<Foo
  userName="hello"
  phoneNumber={12345678}
/>;
```

- 如果 prop 的值是 true 可以忽略这个值，直接写 prop 名就可以。

```jsx
// bad
<Foo
  hidden={true}
/> // good
<Foo
  hidden
/> // good
<Foo hidden />;
```

- 避免用数组下标作为 key 属性，推荐用稳定的 ID

```jsx
// bad
{
  todos.map((todo, index) => <Todo {...todo} key={index} />);
}

// good
{
  todos.map((todo) => <Todo {...todo} key={todo.id} />);
}
```

- 对于所有非必须属性（带问号的），定义一个明确的默认值。
- 使用 defaultProps 赋予默认 props

```jsx
// bad
function SFC({ foo, bar, children }) {
  return <div>{foo}{bar}{children}</div>;
}
interface SFCProps {
  foo: PropTypes.number.isRequired,
  bar: PropTypes.string,
  children: PropTypes.node,
};

// good
function SFC({ foo, bar, children }) {
  return <div>{foo}{bar}{children}</div>;
}
interface SFCProps {
  foo: PropTypes.number.isRequired,
  bar: PropTypes.string,
  children: PropTypes.node,
};
SFC.defaultProps = {
  bar: '',
  children: null,
} as SPCProps;
```

## 顺序

- 组件文件中的顺序

1. import 语句
2. const 定义
3. Props 声明和 stateless 的组件实现（不使用 hook）
4. Props 声明和 state 组件实现
5. 导出语句

- 组件内部的顺序

1. props 的解构
2. 使用 hooks
3. 业务逻辑和函数定义
4. 返回组件

## 组件

- 组件声明优先使用函数，如果 props 中存在可选属性，应该使用 defaultProps 为其设置默认值。

```tsx
export interface MyComponentProps {
  className?: string;
  style: React.CSSProperties;
}

export function MyComponent(props: PropsWithChildren<MyComponentProps>) {
  const { className, style, children } = props;
  return (

<div
    className={className}
    style={style}
    >
    {children}
    </div>
  );
}

MyComponent.defaultProps = {
    className: "some-style",
}
```

- 函数式组件声明也可以使用 React.FC

```tsx
import React, { FC } from 'react';

/**

* 声明Props类型
  */
  export interface MyComponentProps {
  className?: string;
  style?: React.CSSProperties;
  }

export const MyComponent: FC<MyComponentProps> = props => {
  return <div>hello react</div>;
};
```

- 子组件声明

使用 Parent.Child 形式的 JSX 可以让节点父子关系更加直观, 它类似于一种命名空间的机制, 可以避免命名冲突，尽量避免 ParentChild 这种命名方式。

```tsx
import React, { PropsWithChildren } from 'react';

export interface LayoutProps {}
export interface LayoutHeaderProps {} // 采用ParentChildProps形式命名
export interface LayoutFooterProps {}

export function Layout(props: PropsWithChildren<LayoutProps>) {
  return <div className="layout">{props.children}</div>;
}

// 作为父组件的属性
Layout.Header = (props: PropsWithChildren<LayoutHeaderProps>) => {
  return <div className="header">{props.children}</div>;
};

Layout.Footer = (props: PropsWithChildren<LayoutFooterProps>) => {
  return <div className="footer">{props.children}</div>;
};

// Test
<Layout>
  <Layout.Header>header</Layout.Header>
  <Layout.Footer>footer</Layout.Footer>
</Layout>;
```

- 单一职责，一个组件负责一件事情。 将组件分为合适的粒度，尽量能被复用。

  - 降低组件的复杂度. 职责单一组件代码量少, 容易被理解, 可读性高

- 降低对其他组件的耦合. 当变更到来时可以降低对其他功能的影响, 不至于牵一发而动全身
- 提高可复用性. 功能越单一可复用性越高, 就比如一些基础组件
- 如果组件不需要状态, 则使用无状态组件
- 如果组件内部存在较多条件控制流, 这通常意味着需要对组件进行抽取
- 容器组件和展示组件分离

  - 展示组件是一个只关注展示的'元件', 为了可以在多个地方被复用, 它不应该耦合'业务/功能', 或者说不应该过渡耦合. 像 antd 这类组件库提供通用组件显然就是'展示组件'
  - 容器组件主要关注业务处理. 容器组件一般以'高阶组件'形式存在, 它一般 ① 从外部数据源(redux 这些状态管理器或者直接请求服务端数据)获取数据, 然后 ② 组合展示组件来构建完整的视图.

- 按照 UI 划分为布局组件和内容组件
- 布局组件用于控制页面的布局，为内容组件提供占位。通过 props 传入组件来进行填充. 比如 Grid, Layout, HorizontalSplit
- 内容组件会包含一些内容，而不仅有布局。内容组件通常被布局组件约束在占位内. 比如 Button, Label, Input

## 函数

- 不要直接使用 export default 的方式导出组件

这种方式导出的组件在 React Inspector 查看时会显示为 Unknown

```tsx
export default (props: {}) => {
  return <div>hello react</div>;
};

如果非得这么做, 请使用命名 function 定义:

export default function Foo(props: {}) {
  return <div>xxx</div>;
}
```

## context

- Context 提供了一种跨组件间状态共享机制

```tsx
import React, { FC, useContext } from 'react';

export interface Theme {
  primary: string;
  secondary: string;
}

/**

* 声明Context的类型, 以{Name}ContextValue命名
  */
export interface ThemeContextValue {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

/**

* 创建Context, 并设置默认值, 以{Name}Context命名
  */
export const ThemeContext = React.createContext<ThemeContextValue>({
  theme: {
    primary: 'red',
    secondary: 'blue',
  },
  onThemeChange: noop,
});

/**

* Provider, 以{Name}Provider命名
  */
export const ThemeProvider: FC<{ theme: Theme; onThemeChange: (theme: Theme) => void }> = (
  props,
) => {
  return (
    <ThemeContext.Provider value={{ theme: props.theme, onThemeChange: props.onThemeChange }}>
      {props.children}
    </ThemeContext.Provider>
  );
};

/**

* 暴露hooks, 以use{Name}命名
  */
export function useTheme() {
  return useContext(ThemeContext);
}
```

## HOC

HOC 分为两种

- Enhancement HOC，特点是构建出的的新组件，相比于原组件新增了 Props

```tsx
interface EnhancedPaginationProps {
  pageSize: number,
  page: number,
  total: number,
  onPageChange: (page: number, pageSize: number) => void
}

function WithPagination<Props>(WrappedComponent: React.ComponentType<Props>) {
  return (props: PropsWithChildren<Props> & EnhancedPaginationProps) => {
    const {
      pageSize, page, total, onPageChange,
    } = props;
    return (
      <div
        style={
                {
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }
            }
      >
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <WrappedComponent {...props as PropsWithChildren<Props>} />
        {
                total > pageSize
                    && (
                    <Pagination
                      current={page}
                      showSizeChanger
                      defaultCurrent={1}
                      total={total}
                      pageSizeOptions={[10, 20, 50]}
                      onChange={onPageChange}
                    />
                    )
            }
      </div>
    );
  };
}

export default WithPagination;
```

- Injection HOC，特点是构建出的新组件，相比于原组件减少了 Props

```tsx
interface InjectedStateProps {
  initialState: API.InitialState,
}

export default function PageWithInitialState<Props extends InjectedStateProps>(WrappedComponent: React.ComponentType<Props>): React.FC<Props> {
  return function WithInitialPage(props: Omit<Props, 'initialState'>): React.ReactElement {
    const { initialState, loading } = useModel('@@initialState');
    if (loading || !initialState) {
      return <NotFount />;
    }

    const unionProps = {
      initialState, ...props,
    } as Props;

    // eslint-disable-next-line react/jsx-props-no-spreading
    return <WrappedComponent {...unionProps} />;
  };
}
```

构建 HOC 时应该分清楚 HOC 的类型，injection or enhancement，实现时不应该使用 any，而是应该引入相应的泛型。

## 目录结构

- 一个模块/目录应该由一个‘出口’文件来统一管理模块的导出，限定模块的可见性。index 文件只作为模块出口，不含任何组件，组件应该有自己单独的文件

[https://github.com/hateonion/react-bits-CN](https://github.com/hateonion/react-bits-CN)

## 样式

- CSS in js
- 避免直接使用内联样式
  - 内联 CSS 不支持添加厂商前缀
  - 内联 CSS 不支持复杂的样式配置
  - 不方便阅读
- styled component，将样式放到独立的组件中，方便复用。并且便于统一样式。

```tsx
const Button = styled.button`
  /* Adapt the colors based on primary prop */
  background: ${(props) => (props.primary ? 'palevioletred' : 'white')};
  color: ${(props) => (props.primary ? 'white' : 'palevioletred')};

  font-size: 1em;
  margin: 1em;
  padding: 0.25em 1em;
  border: 2px solid palevioletred;
  border-radius: 3px;
`;

render(
  <div>
    <Button>Normal</Button>
    <Button primary>Primary</Button>
  </div>,
);
```

## Typescript

- 避免使用 any 类型

## TODO

- PageWithBreadCrumb，其中的 alert 逻辑拆分出来

- dashborad 页面中公用逻辑拆分出来，抽出一个公用的组件

- 在应用里使用页面导航时，直接引用 routes 文件中的路由

- 面包屑导航后端应该提供一个独立接口，而不是在查询资源时返回 fullpath
