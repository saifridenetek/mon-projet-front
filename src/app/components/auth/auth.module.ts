import { NgModule } from "@angular/core";
import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { AuthRoutingModule } from "./auth-routing.module";

@NgModule({
    declarations: [],
    imports: [
      CommonModule,
      FormsModule,
      RouterModule,
      AuthRoutingModule,
      LoginComponent,
      RegisterComponent
    ]
  })
  export class AuthModule {}