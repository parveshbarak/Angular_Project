import { Component, OnInit,ViewChild } from '@angular/core';
import {Dish} from '../shared/dish';
import { DishService } from '../services/dish.service';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { switchMap } from 'rxjs/operators';

import { Feedbacks} from '../shared/feedbacks';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})
export class DishdetailComponent implements OnInit {

  @ViewChild('fform') feedbackFormDirective;

  mydate=Date.now();

  formErrors = {
    'name': '',
    'message': ''
  };
  validationMessages = {
    'name': {
      'required':'Name is required.',
      'minlength':' Name must be at least 2 characters long.',
      'maxlength':'Name cannot be more than 25 characters long.'
    },
    'message': {
      'required':'Comment  is required.',
      'minlength':'Comment must be at least 2 characters long.',
      'maxlength':'Comment cannot be more than 100 characters long.'
    },
  };


  users=[];


  feedbackForm: FormGroup;
  feedback: Feedbacks;


  dish : Dish;
  dishIds: string[];
  prev: string;
  next: string;
  myValue=0;
  
  constructor(private dishservice: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder) { 
      this.createForm();
    }

  createForm(){
    this.feedbackForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)] ],
      star:0,
      message: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)] ],
    });

    this.feedbackForm.valueChanges
      .subscribe(data => this.onValueChanged(data));
       this.onValueChanged(); 
  }

  onValueChanged(data?: any) {
    if (!this.feedbackForm) { return; }
    const form = this.feedbackForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }



  onSubmit(uname,ustar,message) {
    this.dish.comments.push({
      rating:ustar.value,
      comment:message.value,
      author:uname.value,
      date:this.mydate.toString()
    });
    this.feedback = this.feedbackForm.value;
     this.feedbackForm.reset({
      name: '',
      message: ''
    });
    this.feedbackFormDirective.resetForm();
  }

  ngOnInit() {
    this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
    this.route.params.pipe(switchMap((params: Params) => this.dishservice.getDish(params['id'])))
    .subscribe(dish => { this.dish = dish; this.setPrevNext(dish.id); });
  }

  goBack(): void {
    this.location.back();
  }
  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

    get name():any { // name property
      return this.feedbackForm.get('name')
   }
   get message():any { // name property
    return this.feedbackForm.get('message')
   }
   get star():any { // name property
    return this.feedbackForm.get('star')
   }
}
