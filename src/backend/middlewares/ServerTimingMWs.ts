import {NextFunction, Request, Response} from 'express';
import {Config} from '../../common/config/private/Config';


export class ServerTimeEntry {
  public name: string;
  startHR: any;
  public endTime: number = null;


  constructor(name: string) {
    this.name = name;
  }

  public start(): void {
    this.startHR = process.hrtime();
  }

  public end(): void {
    const duration = process.hrtime(this.startHR);
    this.endTime = (duration[0] * 1E3) + (duration[1] * 1e-6);
  }
}


export const ServerTime = (id: string, name: string) => {
  return (target: any, propertyName: string, descriptor: TypedPropertyDescriptor<any>): any => {
    if (Config.Server.Log.logServerTiming === false) {
      return;
    }
    const m = descriptor.value;
    descriptor.value = (req: Request, res: Response, next: NextFunction) => {
      req.timing = req.timing || {};
      req.timing[id] = new ServerTimeEntry(name);
      req.timing[id].start();
      m(req, res, (err?: any) => {
        req.timing[id].end();
        next(err);
      });
    };
  };
};


const forcedDebug = process.env.NODE_ENV === 'debug';

export class ServerTimingMWs {


  /**
   * Add server timing
   */
  public static async addServerTiming(req: Request, res: Response, next: NextFunction): Promise<any> {
    if ((Config.Server.Log.logServerTiming === false && !forcedDebug) || !req.timing) {
      return next();
    }
    const l = Object.entries(req.timing).filter(e => e[1].endTime).map(e => `${e[0]};dur=${e[1].endTime};desc="${e[1].name}"`);
    res.header('Server-Timing', l.join(', '));
    next();
  }

}
