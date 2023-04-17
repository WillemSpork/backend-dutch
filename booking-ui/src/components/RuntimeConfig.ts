import { Ajax, AjaxCredentials, User, Settings as OrgSettings } from 'flexspace-commons'

interface RuntimeUserInfos {
    username: string;
    isLoading: boolean;
    maxBookingsPerUser: number;
    maxDaysInAdvance: number;
    maxBookingDurationHours: number;
    dailyBasisBooking: boolean;
    showNames: boolean;
    defaultTimezone: string;
}

export default class RuntimeConfig {
    static EMBEDDED: boolean = false;
    static INFOS: RuntimeUserInfos = {
        username: "",
        isLoading: true,
        maxBookingsPerUser: 0,
        maxDaysInAdvance: 0,
        maxBookingDurationHours: 0,
        dailyBasisBooking: false,
        showNames: false,
        defaultTimezone: "",
    };

    static verifyToken = async (resolve: Function) => {
        Ajax.CREDENTIALS = await Ajax.PERSISTER.readCredentialsFromSessionStorage();
        if (!Ajax.CREDENTIALS.accessToken) {
            Ajax.CREDENTIALS = await Ajax.PERSISTER.readRefreshTokenFromLocalStorage();
            if (Ajax.CREDENTIALS.refreshToken) {
                await Ajax.refreshAccessToken(Ajax.CREDENTIALS.refreshToken);
            }
        }
        if (Ajax.CREDENTIALS.accessToken) {
            User.getSelf().then(user => {
                RuntimeConfig.loadSettings().then(() => {
                    RuntimeConfig.setDetails(user.email);
                    resolve();
                    //this.setState({ isLoading: false });
                });
            }).catch((e) => {
                Ajax.CREDENTIALS = new AjaxCredentials();
                Ajax.PERSISTER.deleteCredentialsFromSessionStorage().then(() => {
                    resolve();
                    //this.setState({ isLoading: false });
                });
            });
        } else {
            resolve();
            //this.setState({ isLoading: false });
        }
    }

    static loadSettings = async (): Promise<void> => {
        return new Promise<void>(function (resolve, reject) {
            OrgSettings.list().then(settings => {
                settings.forEach(s => {
                    if (typeof window !== 'undefined') {
                        if (s.name === "max_bookings_per_user") RuntimeConfig.INFOS.maxBookingsPerUser = window.parseInt(s.value);
                        if (s.name === "max_days_in_advance") RuntimeConfig.INFOS.maxDaysInAdvance = window.parseInt(s.value);
                        if (s.name === "max_booking_duration_hours") RuntimeConfig.INFOS.maxBookingDurationHours = window.parseInt(s.value);
                    }
                    if (s.name === "daily_basis_booking") RuntimeConfig.INFOS.dailyBasisBooking = (s.value === "1");
                    if (s.name === "show_names") RuntimeConfig.INFOS.showNames = (s.value === "1");
                    if (s.name === "default_timezone") RuntimeConfig.INFOS.defaultTimezone = s.value;
                });
                resolve();
            });
        });
    }

    static setDetails = (username: string) => {
        RuntimeConfig.loadSettings().then(() => {
            RuntimeConfig.INFOS.username = username;
        });
    }

    static async setLoginDetails(): Promise<void> {
        return User.getSelf().then(user => {
            RuntimeConfig.setDetails(user.email);
        });
    }
}