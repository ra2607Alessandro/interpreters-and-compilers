enum Types  {
    Number,  Identifier, String, Equal,   DoubleEqual,  Greater, Inferior,Greater_Equal,Inferior_Equal,Colon,  SemiColon, LeftParen, RightParen, Comma,
    Dot,  And, Class,  Interface, Null, Var, True, False,
    Else, While,Print, Return, EOF
}

export interface Token {
    lexeme : string;
    literal : {};
    type: Types;
    line: number
}



