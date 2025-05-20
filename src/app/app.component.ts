import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],  // Add RouterModule to imports array
  template: '<router-outlet></router-outlet>',
})
export class AppComponent {}