import {Component, EventEmitter, forwardRef, Input, Output} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {AutoCompleteService} from '../autocomplete.service';
import {SearchQueryDTO} from '../../../../../../common/entities/SearchQueryDTO';
import {ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator} from '@angular/forms';
import {SearchQueryParserService} from '../search-query-parser.service';
import {TemplateRef} from '../../../../../../../node_modules/@angular/core';
import {BsModalRef, BsModalService} from '../../../../../../../node_modules/ngx-bootstrap/modal';

@Component({
  selector: 'app-gallery-search-field',
  templateUrl: './search-field.gallery.component.html',
  styleUrls: ['./search-field.gallery.component.css'],
  providers: [
    AutoCompleteService, RouterLink,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GallerySearchFieldComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => GallerySearchFieldComponent),
      multi: true
    }
  ]
})
export class GallerySearchFieldComponent implements ControlValueAccessor, Validator {

  @Output() search = new EventEmitter<void>();
  @Input() placeholder: string;
  public rawSearchText = '';
  public searchQueryDTO: SearchQueryDTO;
  private searchModalRef: BsModalRef;

  constructor(private autoCompleteService: AutoCompleteService,
              private searchQueryParserService: SearchQueryParserService,
              private modalService: BsModalService,
              public router: Router) {
  }


  public async openSearchModal(template: TemplateRef<any>): Promise<void> {
    this.searchModalRef = this.modalService.show(template, {class: 'modal-lg'});
    document.body.style.paddingRight = '0px';
  }


  public hideSearchModal(): void {
    this.searchModalRef.hide();
    this.searchModalRef = null;
  }


  public onTouched(): void {
  }


  public writeValue(obj: any): void {
    this.searchQueryDTO = obj;
    this.rawSearchText = this.searchQueryParserService.stringify(this.searchQueryDTO);
  }

  registerOnChange(fn: (_: any) => void): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.propagateTouch = fn;
  }


  public onChange(): void {
    this.propagateChange(this.searchQueryDTO);
  }

  validate(control: FormControl): ValidationErrors {
    return {required: true};
  }


  onQueryChange(): void {
    this.rawSearchText = this.searchQueryParserService.stringify(this.searchQueryDTO);
    this.onChange();
  }

  validateRawSearchText(): void {
    try {
      this.searchQueryDTO = this.searchQueryParserService.parse(this.rawSearchText);
      this.onChange();
    } catch (e) {
      console.error(e);
    }
  }


  private propagateChange = (_: any): void => {
  };

  private propagateTouch = (_: any): void => {
  };
}

