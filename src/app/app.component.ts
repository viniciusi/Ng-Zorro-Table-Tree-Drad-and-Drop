import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';

export interface TreeNodeInterface {
  key: number;
  name: string;
  age?: number;
  level?: number;
  expand?: boolean;
  address?: string;
  children?: TreeNodeInterface[];
  parent?: TreeNodeInterface;
}

@Component({
  selector: 'nz-demo-table-drag-sorting',
  template: `
    <nz-table #expandTable [nzData]="listOfMapData" [nzFrontPagination]="false" [nzShowPagination]="false">
      <thead>
        <tr>
          <th nzWidth="40%">Name</th>
          <th nzWidth="30%">Age</th>
          <th>Address</th>
        </tr>
      </thead>
      <tbody cdkDropList [cdkDropListData]="listOfMapData" (cdkDropListDropped)="drop($event)">
        <ng-container *ngFor="let data of listOfMapData">
          <ng-container *ngFor="let item of mapOfExpandedData[data.key]">
            <tr *ngIf="(item.parent && item.parent.expand) || !item.parent" cdkDrag    [cdkDragData]="item">
              <td
                [nzIndentSize]="item.level * 20"
                [nzShowExpand]="!!item.children"
                [(nzExpand)]="item.expand"
                (nzExpandChange)="collapse(mapOfExpandedData[data.key], item, $event)"

              >
                {{ item.name }}
              </td>
              <td>{{ item.age }}</td>
              <td>{{ item.address }}</td>
            </tr>
          </ng-container>
        </ng-container>
      </tbody>
    </nz-table>
  `,
  styles: [
    `
      ::ng-deep .cdk-drag-preview {
        display: table;
      }

      ::ng-deep .cdk-drag-placeholder {
        opacity: 0;
      }
    `,
  ],
})
export class NzDemoTableDragSortingComponent implements OnInit {
  listOfMapData = [
    {
      key: 1,
      name: 'John Brown sr.',
      age: 60,
      address: 'New York No. 1 Lake Park',
      children: [
        {
          key: 11,
          name: 'John Brown',
          age: 42,
          address: 'New York No. 2 Lake Park',
        },
        {
          key: 12,
          name: 'John Brown jr.',
          age: 30,
          address: 'New York No. 3 Lake Park',
          children: [
            {
              key: 121,
              name: 'Jimmy Brown',
              age: 16,
              address: 'New York No. 3 Lake Park',
            },
          ],
        },
        {
          key: 13,
          name: 'Jim Green sr.',
          age: 72,
          address: 'London No. 1 Lake Park',
          children: [
            {
              key: 131,
              name: 'Jim Green',
              age: 42,
              address: 'London No. 2 Lake Park',
              children: [
                {
                  key: 1311,
                  name: 'Jim Green jr.',
                  age: 25,
                  address: 'London No. 3 Lake Park',
                },
                {
                  key: 1312,
                  name: 'Jimmy Green sr.',
                  age: 18,
                  address: 'London No. 4 Lake Park',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      key: 2,
      name: 'Joe Black',
      age: 32,
      address: 'Sidney No. 1 Lake Park',
    },
  ];

  drop(event: CdkDragDrop<string[]>): void {
    console.log(event);
    moveItemInArray(
      this.listOfMapData,
      event.previousIndex,
      event.currentIndex
    );
  }

  mapOfExpandedData: { [key: string]: TreeNodeInterface[] } = {};

  collapse(
    array: TreeNodeInterface[],
    data: TreeNodeInterface,
    $event: boolean
  ): void {
    if ($event === false) {
      if (data.children) {
        data.children.forEach((d) => {
          const target = array.find((a) => a.key === d.key)!;
          target.expand = false;
          this.collapse(array, target, false);
        });
      } else {
        return;
      }
    }
  }

  convertTreeToList(root: TreeNodeInterface): TreeNodeInterface[] {
    const stack: TreeNodeInterface[] = [];
    const array: TreeNodeInterface[] = [];
    const hashMap = {};
    stack.push({ ...root, level: 0, expand: false });

    while (stack.length !== 0) {
      const node = stack.pop()!;
      this.visitNode(node, hashMap, array);
      if (node.children) {
        for (let i = node.children.length - 1; i >= 0; i--) {
          stack.push({
            ...node.children[i],
            level: node.level! + 1,
            expand: false,
            parent: node,
          });
        }
      }
    }

    return array;
  }

  visitNode(
    node: TreeNodeInterface,
    hashMap: { [key: string]: boolean },
    array: TreeNodeInterface[]
  ): void {
    if (!hashMap[node.key]) {
      hashMap[node.key] = true;
      array.push(node);
    }
  }

  ngOnInit(): void {
    this.listOfMapData.forEach((item) => {
      this.mapOfExpandedData[item.key] = this.convertTreeToList(item);
    });
  }
}
