export enum Tags {
  Button = 'button',
  Span = 'span',
  Div = 'div',
  Paragraph = 'p',
  Body = 'body',
  Header = 'header',
  Main = 'main',
  Footer = 'footer',
  Section = 'section',
  Input = 'input',
  Icon = 'i',
  Template = 'template',
  Heading1 = 'h1',
  Heading2 = 'h2',
  Heading3 = 'h3',
  Label = 'label',
  Code = 'code',
  Form = 'form',
  SVG = 'svg',
  SVGUse = 'use',
  Image = 'img',
  Table = 'table',
  TableHead = 'thead',
  TableBody = 'tbody',
  TableRow = 'tr',
  TableElement = 'td',
}

export enum Events {
  Click = 'click',
  Input = 'input',
  MouseDown = 'mousedown',
  MouseUp = 'mouseup',
  MouseMove = 'mousemove',
  KeyDown = 'keydown',
  MouseOver = 'mouseover',
  MouseOut = 'mouseout',
  Submit = 'submit',
  TransitionEnd = 'transitionend',
  AnimationEnd = 'animationend',
  Resize = 'resize',
}

export enum InsertPositions {
  Before = 'beforebegin',
  Prepend = 'afterbegin',
  Append = 'beforeend',
  After = 'afterend',
}

export type AnimationParams = {
  name: string;
  duration: number;
  timingFunction?: string;
  repeatCount?: number;
  fillMode?: AnimationFillMode;
};

export enum AnimationFillMode {
  None = 'none',
  Forwards = 'forwards',
  Backwards = 'backwards',
  Both = 'both',
}

export enum TransformOrigin {
  Center = 'center',
  BottomLeft = 'bottom left',
  BottomRight = 'bottom right',
}

export enum InputTypes {
  Text = 'text',
  Checkbox = 'checkbox',
  Submit = 'submit',
  Color = 'color',
}

export enum NodeTypes {
  ElementNode = 1,
  AttributeNode,
  TextNode,
}

export type HTMLSVGElement = HTMLElement & SVGElement;
