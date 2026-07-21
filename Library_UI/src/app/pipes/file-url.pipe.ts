import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../environments/environment';

@Pipe({ name: 'fileUrl', standalone: true, pure: true })
export class FileUrlPipe implements PipeTransform {
  transform(path: string | null | undefined): string {
    if (!path) return '/assets/placeholder.png';
    if (path.startsWith('http')) return path;
    return environment.fileBaseUrl + path;
  }
}
