import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { demoCategories, demoRegistry, findDemo, type DemoCategory } from './demo-registry';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: {
    '(document:keydown)': 'onGlobalKeydown($event)',
  },
})
export class App {
  private readonly router = inject(Router);

  protected readonly registry = demoRegistry;
  protected readonly categories = demoCategories;

  protected readonly searchText = signal('');
  protected readonly sidebarOpen = signal(false);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.router.url),
      takeUntilDestroyed(),
    ),
    { initialValue: this.router.url },
  );

  protected readonly activeDemo = computed(() => findDemo(this.extractDemoId(this.url())));

  protected readonly activeIndex = computed(() => demoRegistry.findIndex((demo) => demo.id === this.activeDemo().id));

  protected readonly filteredDemos = computed(() => {
    const keyword = this.searchText().trim().toLowerCase();
    if (!keyword) return demoRegistry;
    return demoRegistry.filter((demo) =>
      [demo.title, demo.description, demo.id, demo.category].some((value) => value.toLowerCase().includes(keyword)),
    );
  });

  protected readonly groupedDemos = computed(() => {
    const demos = this.filteredDemos();
    return demoCategories.reduce(
      (groups, category) => {
        groups[category] = demos.filter((demo) => demo.category === category);
        return groups;
      },
      {} as Record<DemoCategory, typeof demoRegistry>,
    );
  });

  protected readonly visibleCategories = computed(() =>
    demoCategories.filter((category) => this.groupedDemos()[category].length > 0),
  );

  protected selectDemo(id: string): void {
    this.sidebarOpen.set(false);
    if (id === this.activeDemo().id) return;
    void this.router.navigate(['/demos', id]);
  }

  protected categoryIndex(category: DemoCategory): number {
    return demoCategories.indexOf(category) + 1;
  }

  protected onSearchInput(event: Event): void {
    this.searchText.set((event.target as HTMLInputElement).value);
  }

  protected onGlobalKeydown(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      document.querySelector<HTMLInputElement>('.search-box input')?.focus();
    }
  }

  protected pad(index: number): string {
    return String(index).padStart(2, '0');
  }

  private extractDemoId(url: string): string | undefined {
    const match = url.match(/\/demos\/([^/?#]+)/);
    return match ? decodeURIComponent(match[1]) : undefined;
  }
}
