import { Module } from '@nestjs/common';

import { AppConfigService } from '../../config/app-config.service';
import { AdminMediaController } from './admin-media.controller';
import { MediaService } from './media.service';
import { createMediaStorage, MEDIA_STORAGE } from './media-storage';
import { PublicMediaController } from './public-media.controller';

@Module({
  controllers: [AdminMediaController, PublicMediaController],
  providers: [
    MediaService,
    {
      provide: MEDIA_STORAGE,
      useFactory: (config: AppConfigService) => createMediaStorage(config),
      inject: [AppConfigService],
    },
  ],
  exports: [MediaService],
})
export class MediaModule {}
