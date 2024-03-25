import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

interface ITranslation {
   key: string;
   'uz.json'?: string;
   'ru.json'?: string;
}

@Component({
   selector: 'app-root',
   templateUrl: './app.component.html',
   styleUrls: [ './app.component.scss' ]
})

export class AppComponent implements OnInit {
   @ViewChild('paginator') paginator: MatPaginator;
   public searchParams = {
      search: '',
      page: 0
   };
   public filesDirectory: string;
   public translations: ITranslation[] = [];
   public total = 0;
   public translationItem: ITranslation;
   public translationItemKeyCount: number;
   public translationsKeys: string[] = [];
   public translateForm = new FormGroup({
      'key': new FormControl(null, Validators.required),
      'uz': new FormControl(null),
      'ru': new FormControl(null)
   });
   public convertPending = false;
   private _host = 'http://localhost:3000/';

   constructor(
      private _httpClient: HttpClient,
      private _snackbar: MatSnackBar
   ) {
   }

   ngOnInit(): void {
      if (localStorage.getItem('filesDirectory')) {
         this.filesDirectory = localStorage.getItem('filesDirectory');
      }

      if (this.filesDirectory) {
         this.getTranslations();
      }
   }

   getTranslations(): void {
      this._httpClient.post<{
         total: number;
         translations: ITranslation[];
         translationsKeys: string[]
      }>(this._host + 'get-translations', {
         filesDirectory: this.filesDirectory,
         ...this.searchParams
      })
         .subscribe((res: { total: number; translations: ITranslation[]; translationsKeys: string[] }) => {
            this.translations = res?.translations;
            this.total = res?.total;
            this.translationsKeys = res.translationsKeys;
            if (this.total) {
               this.translationItem = res?.translations[0];
               this.translationItemKeyCount = Object.keys(this.translationItem)?.length;

               if (this.translationItem['uz.json']) {
                  this.translateForm.get('uz').setValidators(Validators.required);
                  this.translateForm.get('uz').updateValueAndValidity();
               }
               if (this.translationItem['ru.json']) {
                  this.translateForm.get('ru').setValidators(Validators.required);
                  this.translateForm.get('ru').updateValueAndValidity();
               }
            }
         });
   }

   changePage($event: PageEvent): void {
      this.searchParams.page = $event.pageIndex;

      this.getTranslations();
   }

   search() {
      if (this.searchParams.page !== 0) {
         this.paginator.firstPage();
         return;
      }

      this.getTranslations();
   }

   convert($event: Event): void {
      console.log(1);
      $event.preventDefault();
      this.convertPending = true;
      this._httpClient.post(this._host + 'convert', {
         uz: this.translateForm.get('uz').value
      })
         .subscribe(res => {
            this.translateForm.patchValue(res);
            this.convertPending = false;
         }, () => {
            this.convertPending = false;
         });
   }

   addNewWord(): void {
      if (this.translateForm.invalid || this.translationsKeys?.includes(this.translateForm.get('key')?.value?.trim())) {
         return;
      }
      this._httpClient.post<{ ok: boolean; message: string }>(this._host + 'add', {
         filesDirectory: this.filesDirectory,
         ...this.translateForm.value
      })
         .subscribe((res) => {
            this._snackbar.open(res.message, 'Tushunarli', { duration: 5000 });
            this.translateForm.reset();
            this.paginator.lastPage();
            this.getTranslations();
         });
   }

   edit($event: Event, key: string, lang: string, newValue: string) {
      $event.preventDefault();

      if (newValue.trim().length) {
         this._httpClient.post<{ ok: boolean; message: string }>(this._host + 'edit', {
            filesDirectory: this.filesDirectory, key, lang, newValue
         })
            .subscribe((res) => {
               this._snackbar.open(res?.message, 'Tushunarli', { duration: 5000 });
            });
      }
   }

   setFilesDirectory(value: string): void {
      this.filesDirectory = value;
      this.getTranslations();
      localStorage.setItem('filesDirectory', value);
   }

   exit() {
      localStorage.removeItem('filesDirectory');
      this.filesDirectory = null;
   }
}
