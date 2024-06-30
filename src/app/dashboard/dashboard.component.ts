import { CommonModule } from '@angular/common';
import { HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Trade } from '@core/http/http.model';
import { TradeAggregationService } from '@core/services/TradeAggregationService.service';
import { UntilDestroy } from '@ngneat/until-destroy';
import { HeaderComponent } from './header/header.component';
import { SingleJobComponent } from './single-job/single-job.component';

export interface GroupedTrades {
  [key: string]: Trade[];
}
@UntilDestroy()
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HeaderComponent, SingleJobComponent, HttpClientModule, HttpClientJsonpModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  public tradeAggregationService = inject(TradeAggregationService);
  public groupedTrades$ = inject(TradeAggregationService).aggregatesData$;
  public trades: Trade[] = [];

  ngOnInit(): void {
    this.tradeAggregationService.getData();
  }

  trackByIndex(index: number): number {
    return index;
  }
}
