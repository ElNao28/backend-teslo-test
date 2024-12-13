import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcr from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { JtwPayload } from './interfaces/jwt.payload.interface';


@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async createUser(createUserhDto: CreateUserDto) {
    try {
      const { password, ...rest } = createUserhDto;
      const user = this.userRepository.create({
        password: bcr.hashSync(password, 10),
        ...rest,
      });

      await this.userRepository.save(user);
      delete user.password;

      return {
        ...user,
        token: this.getJwtToken({ id:user.id })
      };
    } catch (error) {
      this.handeleDBErrors(error);
    }

  }

  async login(loginUserDto:LoginUserDto){
    
    const { email, password } = loginUserDto;

    const user = await this.userRepository.findOne({ 
      where: { email },
      select:{id:true, password:true}
    });

    if (!user) throw new UnauthorizedException('Invalid credentials (email)');

    if( !bcr.compareSync(password, user.password)) throw new UnauthorizedException('Invalid credentials (password)');

    return {
      ...user,
      token: this.getJwtToken( { id: user.id } )
    };

  }

  private getJwtToken( payload:JtwPayload ){
    const token = this.jwtService.sign( payload );
    return token;
  }


  private handeleDBErrors(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    console.log(error);
    throw new InternalServerErrorException('Please check server logs');
  }
}
