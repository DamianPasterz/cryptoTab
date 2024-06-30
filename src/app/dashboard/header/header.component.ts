import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  public headerTitles = [
    {
      title: 'Symbol',
    },
    {
      title: 'Order ID',
    },
    {
      title: 'Side',
    },
    {
      title: 'Size',
    },
    {
      title: 'Open Time',
    },
    {
      title: 'Open price',
    },
    {
      title: 'Swap',
    },
    {
      title: 'Profit',
    }
  ]
}
