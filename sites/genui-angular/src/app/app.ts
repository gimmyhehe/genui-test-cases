import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GenuiExample } from './genui-example';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GenuiExample],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
