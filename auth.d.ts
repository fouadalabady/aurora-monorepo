export declare const handlers: any, auth: any, signIn: any, signOut: any;
export declare const authOptions: {
    adapter: any;
    providers: any[];
    session: {
        strategy: "jwt";
        maxAge: number;
    };
    jwt: {
        maxAge: number;
    };
    pages: {
        signIn: string;
        error: string;
        verifyRequest: string;
        newUser: string;
    };
    callbacks: {
        jwt({ token, user, account }: any): Promise<any>;
        session({ session, token }: any): Promise<any>;
        signIn({ user, account, profile }: any): Promise<boolean>;
    };
    events: {
        signIn({ user, account, isNewUser }: any): Promise<void>;
        signOut({ session, token }: any): Promise<void>;
    };
    debug: boolean;
};
//# sourceMappingURL=auth.d.ts.map