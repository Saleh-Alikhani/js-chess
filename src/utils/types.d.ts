declare interface MyHtmlDivElement extends HTMLDivElement {
  firstChild: any;
}

// declare interface ParentNode {
//   getAttribute: any;
// }

declare interface MyNode extends Node {
  getAttribute: any;
  classList: any;
  setAttribute: any;
  id: string;
  firstChild: any;
  parentNode: any;
}

export module a {
  MyNode, MyHtmlDivElement;
}
