import { Tags } from '../types/dom-types';
import DOMComponent from './base-component';

export default class TableComponent extends DOMComponent<HTMLTableElement> {
  protected tableHead: DOMComponent<HTMLElement>;

  protected tableBody: DOMComponent<HTMLElement>;

  protected headElements: DOMComponent<HTMLElement>[];

  public constructor(columnNames: string[]) {
    super({ tag: Tags.Table });
    this.tableHead = new DOMComponent<HTMLElement>({
      tag: Tags.TableHead,
      parent: this,
    });
    const tableHeadRow = new DOMComponent<HTMLElement>({
      tag: Tags.TableRow,
      parent: this.tableHead,
    });

    this.headElements = columnNames.map(
      (name) =>
        new DOMComponent<HTMLElement>({
          tag: Tags.TableElement,
          textContent: name,
        })
    );
    tableHeadRow.append(...this.headElements);

    this.tableBody = new DOMComponent<HTMLElement>({
      tag: Tags.TableBody,
      parent: this,
    });
  }

  public addRow(elements: (DOMComponent<HTMLElement> | string)[]) {
    const row = new DOMComponent<HTMLElement>({
      tag: Tags.TableRow,
      parent: this.tableBody,
    });
    elements.forEach((element) => {
      const tableElement = new DOMComponent<HTMLElement>({
        tag: Tags.TableElement,
        parent: row,
      });
      if (typeof element === 'string') tableElement.textContent = element;
      else tableElement.append(element);
    });
  }

  public clearRows(): void {
    this.tableBody.clear();
  }
}
