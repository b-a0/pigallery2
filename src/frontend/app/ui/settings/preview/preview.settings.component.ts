import {Component, OnInit} from '@angular/core';
import {SettingsComponentDirective} from '../_abstract/abstract.settings.component';
import {AuthenticationService} from '../../../model/network/authentication.service';
import {NavigationService} from '../../../model/navigation.service';
import {NotificationService} from '../../../model/notification.service';
import {DefaultsJobs, JobDTOUtils} from '../../../../../common/entities/job/JobDTO';
import {ScheduledJobsService} from '../scheduled-jobs.service';
import {JobProgressDTO, JobProgressStates} from '../../../../../common/entities/job/JobProgressDTO';
import {ServerPreviewConfig} from '../../../../../common/config/private/PrivateConfig';
import {PreviewSettingsService} from './preview.settings.service';

@Component({
  selector: 'app-settings-preview',
  templateUrl: './preview.settings.component.html',
  styleUrls: ['./preview.settings.component.css',
    '../_abstract/abstract.settings.component.css'],
  providers: [PreviewSettingsService],
})
export class PreviewSettingsComponent
  extends SettingsComponentDirective<ServerPreviewConfig>
  implements OnInit {
  JobProgressStates = JobProgressStates;
  readonly jobName = DefaultsJobs[DefaultsJobs['Preview Filling']];
  readonly resetJobName = DefaultsJobs[DefaultsJobs['Preview Reset']];

  constructor(authService: AuthenticationService,
              navigation: NavigationService,
              settingsService: PreviewSettingsService,
              notification: NotificationService,
              public jobsService: ScheduledJobsService) {
    super($localize`Preview`, 'image', authService, navigation, settingsService, notification, s => s.Server.Preview);
  }

  get Config(): any {
    return {};
  }


  get Progress(): JobProgressDTO {
    return this.jobsService.progress.value[JobDTOUtils.getHashName(this.jobName, this.Config)];
  }

  ngOnInit(): void {
    super.ngOnInit();
  }
}



